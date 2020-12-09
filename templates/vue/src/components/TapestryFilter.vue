<template>
  <div data-qa="tapestry-filter" class="filter">
    <button
      v-if="!settings.renderMap"
      aria-label="search"
      :style="isActive && 'margin-right: 12px;'"
      @click="toggleFilter"
    >
      <i class="fas fa-search"></i>
    </button>
    <div
      :class="['input-container', { 'input-container-show': isActive }]"
      :hidden="!isActive"
    >
      <b-form-select
        id="search-type"
        v-model="type"
        :options="typeOptions"
      ></b-form-select>
      <v-select
        v-if="type !== types.STATUS"
        v-model="filterValue"
        data-qa="search-input"
        :filter="getVisibleMatches"
        :options="filterOptions"
        :clear-search-on-blur="() => false"
        :label="type === types.AUTHOR ? 'name' : 'title'"
        @search="val => (search = val)"
      ></v-select>
      <select
        v-else
        id="status-select"
        v-model="filterValue"
        class="custom-select"
        data-qa="status-select"
      >
        <option
          v-for="option in statuses"
          :key="option.value"
          :value="option.value"
          :disabled="option.count === 0"
        >
          {{ option.label }}
        </option>
      </select>
      <div class="spinner">
        <b-spinner
          v-if="loading"
          data-qa="search-loading"
          label="Loading"
        ></b-spinner>
      </div>
    </div>
  </div>
</template>

<script>
import "vue-select/dist/vue-select.css"
import { mapActions, mapMutations, mapState } from "vuex"
import { matchSorter } from "match-sorter"
import client from "../services/TapestryAPI"
import * as wp from "../services/wp"
import { nodeStatus } from "@/utils/constants"
import Helpers from "@/utils/Helpers"

const filterTypes = {
  AUTHOR: "Author",
  TITLE: "Title",
  STATUS: "Status",
}

const statusMap = {
  all: "All",
  [nodeStatus.DRAFT]: "Draft",
  [nodeStatus.SUBMIT]: "Submitted",
  [nodeStatus.REJECT]: "Rejected",
  [nodeStatus.ACCEPT]: "Accepted",
  [nodeStatus.PUBLISH]: "Published",
}

export default {
  name: "tapestry-filter",
  data() {
    return {
      allContributors: null,
      loading: false,
      search: "",
      allStatuses: null,
    }
  },
  computed: {
    ...mapState(["nodes", "settings"]),
    type: {
      get() {
        const search = this.$route.query.search
        if (search) {
          return this.capitalize(search)
        }
        return search
      },
      set(type) {
        if (type && type !== this.type) {
          this.$router.replace({
            path: this.$route.path,
            query: {
              ...this.$route.query,
              search: type.toLowerCase(),
              query: type === filterTypes.STATUS ? "all" : "",
            },
          })
        }
      },
    },
    filterValue: {
      get() {
        return this.$route.query.query
      },
      set(val) {
        let serializedVal = val

        if (typeof val === "object") {
          serializedVal = this.type === filterTypes.AUTHOR ? val.name : val.title
        }

        if (val !== this.filterValue) {
          this.$router.replace({
            path: this.$route.path,
            query: { ...this.$route.query, query: serializedVal },
          })
        }
      },
    },
    isActive: {
      get() {
        return Boolean(this.type)
      },
      set(isActive) {
        if (isActive) {
          this.$router.push({
            path: this.$route.path,
            query: { ...this.$route.query, search: filterTypes.TITLE.toLowerCase() },
          })
        } else {
          this.$router.push({
            path: this.$route.path,
            query: Helpers.omit(this.$route.query, ["search", "query"]),
          })
        }
      },
    },
    types() {
      return filterTypes
    },
    typeOptions() {
      return Object.values(this.types).filter(
        type => wp.canEditTapestry() || type !== filterTypes.AUTHOR
      )
    },
    statuses() {
      let statusTypes = Object.keys(statusMap)
      if (!this.settings.showRejected) {
        statusTypes = statusTypes.filter(type => type !== nodeStatus.REJECT)
      }

      const statuses = []
      for (const status of statusTypes) {
        const matches = this.getMatches(status, filterTypes.STATUS)
        statuses.push({
          value: status,
          count: matches.filter(node => Helpers.hasPermission(node, "read")).length,
          label: `${statusMap[status]}: ${matches.length}`,
        })
      }
      return statuses
    },
    filterOptions() {
      switch (this.type) {
        case filterTypes.AUTHOR: {
          let authors = Object.values(this.nodes).map(node => node.author)
          if (this.allContributors !== null) {
            authors = Object.values(this.allContributors)
          }
          return Helpers.unique(authors, "id")
        }
        case filterTypes.TITLE: {
          return Object.values(this.nodes)
        }
        default:
          return []
      }
    },
    visibleNodes() {
      if (this.isActive) {
        if (!this.filterValue && !this.search) {
          return []
        }
        const matches = this.getMatches(
          this.type === filterTypes.STATUS
            ? this.filterValue
            : this.search || this.filterValue
        )
        return matches.map(node => node.id)
      }
      return Object.values(this.nodes).map(node => node.id)
    },
    /**
     * "Lazy" here means there are more nodes in the Tapestry that are not currently
     * visible by the user. Currently this is only possible if the superuser override
     * permission is false.
     */
    lazy() {
      return !this.settings.superuserOverridePermissions
    },
  },
  watch: {
    async filterValue(next) {
      if (
        next &&
        wp.canEditTapestry() &&
        this.lazy &&
        this.type === filterTypes.AUTHOR
      ) {
        this.loading = true
        await this.refetchTapestryData(Number(next.id))
        this.loading = false
      }
    },
    visibleNodes: {
      immediate: true,
      handler(nodes) {
        this.updateVisibleNodes(nodes)
      },
    },
    type: {
      immediate: true,
      handler(type, oldType) {
        if (type !== oldType) {
          const isValidType = Object.values(filterTypes).some(
            validType => validType === type
          )
          if (!isValidType) {
            this.resetSearch()
            this.addApiError({ error: `Unknown search type: ${type}` })
          } else if (type === filterTypes.AUTHOR && !wp.canEditTapestry()) {
            this.resetSearch()
            this.addApiError({ error: `You're not allowed to search by author.` })
          }
        }
      },
    },
  },
  async created() {
    if (wp.canEditTapestry() && this.lazy) {
      this.allContributors = await client.getAllContributors()
    }
  },
  methods: {
    ...mapMutations(["updateVisibleNodes", "addApiError"]),
    ...mapActions(["refetchTapestryData"]),
    toggleFilter() {
      if (this.isActive) {
        this.filterValue = undefined
      }
      this.isActive = !this.isActive
    },
    getVisibleMatches(options, value) {
      if (!value.length) {
        return options
      }
      const matches = this.getMatches(value)
      switch (this.type) {
        case filterTypes.AUTHOR:
          return Helpers.unique(
            matches.map(node => node.author),
            "id"
          )
        case filterTypes.TITLE:
          return matches
      }
    },
    getMatches(value, type = this.type) {
      let val = value
      let match = Object.values(this.nodes)
      if (this.isActive && this.type) {
        switch (type) {
          case filterTypes.AUTHOR: {
            val = typeof val !== "string" ? val.id : val
            match = matchSorter(match, val, {
              keys: ["author.name", "author.id"],
            })
            break
          }
          case filterTypes.TITLE: {
            match = matchSorter(match, val, {
              keys: ["title"],
            })
            break
          }
          case filterTypes.STATUS: {
            if (val !== "all") {
              // for these three, we need to look at the reviewStatus first
              if (
                val === nodeStatus.SUBMIT ||
                val === nodeStatus.ACCEPT ||
                val === nodeStatus.REJECT
              ) {
                match = matchSorter(match, val, {
                  keys: ["reviewStatus"],
                })
              } else {
                match = matchSorter(match, val, {
                  keys: ["status"],
                })
                // get rid of any that have a reviewStatus
                match = match.filter(node => !node.reviewStatus)
              }
            }
            break
          }
          default:
            break
        }
      }
      return match
    },
    capitalize(str) {
      return str[0].toUpperCase() + str.slice(1)
    },
    resetSearch() {
      this.$router.replace({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          search: filterTypes.TITLE.toLowerCase(),
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.filter {
  display: flex;
  height: 3.5rem;
  background: #fbfbfb;
  box-shadow: 0 0 7px 0 #ddd;
  padding: 0.5rem;
  border-radius: 8px;

  button {
    color: #999;
    padding: 0;
    background: none;
    width: 36px;
    font-size: 0.8em;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: #11a6d8;
    }
  }

  .filter-combobox {
    margin-right: 8px;
    &:last-child {
      transform: translateX(-40%);
    }
  }
}

.input-container {
  display: flex;
  opacity: 0;
  transform: translateX(-32px);
  transition: all 0.4s ease-in;
  pointer-events: none;

  &-show {
    opacity: 1;
    transform: translateX(0);
    pointer-events: all;
  }
}

.spinner {
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
}

// !important styles are necessary here to override bootstrap styles

.custom-select {
  height: auto !important;
}

#search-type.custom-select {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  border-right: none !important;
  width: 6rem;
}

#status-select.custom-select {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  width: 12rem;
}

.v-select {
  width: 12rem;
}
</style>

<style lang="scss">
.vs__dropdown-toggle {
  height: 100%;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  padding: 0 !important;
}

.vs__selected-options {
  height: 100%;
  padding: 0 !important;
}

.vs__search {
  border: none !important;
  margin: 0 !important;
  height: 100%;
}

.vs__selected {
  margin: 0;
  padding: 0;
  padding-left: 0.75rem;
}
</style>
