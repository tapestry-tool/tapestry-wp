<template>
  <div data-qa="tapestry-filter" class="filter">
    <button v-if="canSearch" aria-label="search" @click="toggleFilter">
      <i class="fas fa-search"></i>
    </button>
    <div :class="['input-container', { 'input-container-show': isActive }]">
      <b-form-select
        id="search-type"
        v-model="type"
        :options="Object.values(types)"
      ></b-form-select>
      <v-select
        v-if="type !== types.STATUS"
        v-model="filterValue"
        label="name"
        :filter="getVisibleMatches"
        :placeholder="placeholder"
        :options="filterOptions"
        @search="handleSearch"
      ></v-select>
      <b-form-select
        v-else
        id="status-select"
        v-model="filterValue"
        data-qa="status-select"
        :options="statuses"
      ></b-form-select>
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

export default {
  name: "tapestry-filter",
  data() {
    return {
      allContributors: null,
      isActive: false,
      type: filterTypes.TITLE,
      filterValue: "",
      loading: false,
    }
  },
  computed: {
    ...mapState(["nodes", "settings"]),
    canSearch() {
      return wp.canEditTapestry()
    },
    inputStyles() {
      return {
        borderRadius: "4px",
        width: "60%",
      }
    },
    isFilterSelected() {
      return this.type !== ""
    },
    types() {
      return filterTypes
    },
    statuses() {
      return Object.values(nodeStatus)
    },
    placeholder() {
      switch (this.type) {
        case filterTypes.AUTHOR:
          return "Node author"
        case filterTypes.TITLE:
          return "Node title"
        default:
          return ""
      }
    },
    filterOptions() {
      switch (this.type) {
        case filterTypes.AUTHOR: {
          if (this.allContributors !== null) {
            return Object.values(this.allContributors)
          }
          return Helpers.unique(
            Object.values(this.nodes).map(node => node.author),
            "id"
          )
        }
        case filterTypes.TITLE: {
          return Object.values(this.nodes).map(node => node.title)
        }
        default:
          return []
      }
    },
  },
  watch: {
    async filterValue(next) {
      if (!this.settings.superuserOverridePermissions) {
        this.loading = true
        await this.refetchTapestryData(Number(next))
        this.loading = false
      }
      this.handleSearch()
    },
    isActive(isActive) {
      if (isActive) {
        this.updateVisibleNodes([])
      } else {
        this.updateVisibleNodes(Object.values(this.nodes).map(node => node.id))
      }
    },
    type(type) {
      if (type !== filterTypes.STATUS) {
        this.filterValue = ""
      } else {
        this.filterValue = nodeStatus.ALL
      }
    },
  },
  async created() {
    if (this.canSearch) {
      this.allContributors = await client.getAllContributors()
    }
  },
  methods: {
    ...mapMutations(["updateVisibleNodes"]),
    ...mapActions(["refetchTapestryData"]),
    toggleFilter() {
      if (this.isActive) {
        this.type = filterTypes.TITLE
        this.filterValue = ""
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
          return matches.map(node => node.title)
      }
    },
    getMatches(value) {
      let val = value || this.filterValue
      let match = Object.values(this.nodes)
      if (this.isActive && this.type) {
        switch (this.type) {
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
              match = matchSorter(match, val, {
                keys: ["status"],
              })
            }
            break
          }
          default:
            break
        }
      }
      return match
    },
    handleSearch(val) {
      const visibleNodes = this.getMatches(val)
      this.updateVisibleNodes(visibleNodes.map(node => node.id))
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
