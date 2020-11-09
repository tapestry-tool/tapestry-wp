<template>
  <div class="filter">
    <button v-if="canSearch" aria-label="search" @click="toggleFilter">
      <i class="fas fa-search"></i>
    </button>
    <div :class="['input-container', { 'input-container-show': isActive }]">
      <b-form-select v-model="type" :options="Object.values(types)"></b-form-select>
      <v-select
        v-if="type !== types.STATUS"
        v-model="filterValue"
        label="name"
        :placeholder="placeholder"
        :options="filterOptions"
        @search="handleSearch"
      ></v-select>
      <b-form-select
        v-else
        v-model="filterValue"
        data-qa="status-select"
        :options="statuses"
      ></b-form-select>
      <b-spinner v-if="loading" data-qa="search-loading" label="Loading"></b-spinner>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex"
import { matchSorter } from "match-sorter"
import client from "../services/TapestryAPI"
import * as wp from "../services/wp"
import { nodeStatus } from "@/utils/constants"

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
          const authors = []
          const seen = new Set()
          Object.values(this.nodes)
            .map(node => node.author)
            .forEach(author => {
              if (!seen.has(author.id)) {
                authors.push(author)
                seen.add(author.id)
              }
            })
          return authors
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
        this.updateVisibleNodes(this.getVisibleNodes())
        this.loading = false
      }
    },
    isActive(isActive) {
      if (isActive) {
        this.updateVisibleNodes([])
      } else {
        this.updateVisibleNodes(Object.keys(this.nodes).map(id => parseInt(id, 10)))
      }
    },
    type() {
      this.filterValue = ""
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
        this.type = ""
        this.filterValue = ""
      }
      this.isActive = !this.isActive
    },
    getVisibleNodes(value) {
      const val = value || this.filterValue
      let match = Object.values(this.nodes)
      if (this.isActive && this.type) {
        switch (this.type) {
          case filterTypes.AUTHOR: {
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
          default:
            break
        }
      }
      return match.map(node => node.id)
    },
    handleSearch(val) {
      const visibleNodes = this.getVisibleNodes(val)
      this.updateVisibleNodes(visibleNodes)
    },
  },
}
</script>

<style lang="scss" scoped>
.filter {
  display: flex;
  height: 32px;

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
    transform: translateY(-4px);

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
</style>
