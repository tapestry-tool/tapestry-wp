<template>
  <div data-qa="tapestry-filter" class="filter">
    <button
      v-if="canSearch && !settings.renderMap"
      aria-label="search"
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
        :options="Object.values(types)"
      ></b-form-select>
      <v-select
        v-if="type !== types.STATUS"
        v-model="filterValue"
        data-qa="search-input"
        :filter="getVisibleMatches"
        :options="filterOptions"
        :clear-search-on-select="false"
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
  [nodeStatus.ALL]: "All",
  [nodeStatus.DRAFT]: "Draft",
  [nodeStatus.SUBMITTED]: "Submitted",
  [nodeStatus.REJECTED]: "Rejected",
  [nodeStatus.ACCEPTED]: "Accepted",
  [nodeStatus.PUBLISHED]: "Published",
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
              q: type === filterTypes.STATUS ? nodeStatus.ALL : "",
            },
          })
        }
      },
    },
    filterValue: {
      get() {
        return this.$route.query.q
      },
      set(val) {
        let serializedVal = val

        if (typeof val === "object") {
          serializedVal = this.type === filterTypes.AUTHOR ? val.name : val.title
        }

        if (val !== this.filterValue) {
          this.$router.replace({
            path: this.$route.path,
            query: { ...this.$route.query, q: serializedVal },
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
            query: Helpers.omit(this.$route.query, ["search", "q"]),
          })
        }
      },
    },
    canSearch() {
      return wp.canEditTapestry()
    },
    types() {
      return filterTypes
    },
    statuses() {
      let statusTypes = Object.keys(statusMap)
      if (!this.settings.showRejected) {
        statusTypes = statusTypes.filter(type => type !== nodeStatus.REJECTED)
      }

      const statuses = []
      for (const status of statusTypes) {
        const matches = this.getMatches(status, filterTypes.STATUS)
        statuses.push({
          value: status,
          count: matches.length,
          label: `${statusMap[status]}: ${matches.length}`,
        })
      }
      return statuses
    },
    label() {
      switch (this.type) {
        case filterTypes.AUTHOR:
          return "Search by author"
        case filterTypes.TITLE:
          return "Search by title"
        default:
          return "Search by status"
      }
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
    isActive: {
      immediate: true,
      handler(isActive) {
        if (isActive && !this.canSearch) {
          this.$router.replace({
            path: this.$route.path,
            query: Helpers.omit(this.$route.query, ["search", "q"]),
          })
          this.addApiError({
            error: `You don't have access to the search bar for this Tapestry.`,
          })
        }
      },
    },
    async filterValue(next) {
      if (next && this.canSearch && this.lazy && this.type === filterTypes.AUTHOR) {
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
  },
  async created() {
    if (this.canSearch && this.lazy) {
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
            if (val !== nodeStatus.ALL) {
              // for these three, we need to look at the reviewStatus first
              if (
                val === nodeStatus.SUBMITTED ||
                val === nodeStatus.ACCEPTED ||
                val === nodeStatus.REJECTED
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
  },
}
</script>

<style lang="scss" scoped>
.filter {
  display: flex;
  height: 3rem;

  button {
    color: #999;
    padding: 0;
    margin-right: 12px;
    background: #fbfbfb;
    box-shadow: 0 0 7px 0 #ddd;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    font-size: 0.8em;

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
  flex: 1;
}

#status-select.custom-select {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
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
