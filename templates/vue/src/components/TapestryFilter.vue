<template>
  <div class="filter">
    <button @click="toggleFilter">
      <i class="fas fa-search"></i>
    </button>
    <div :class="['input-container', { 'input-container-show': isActive }]">
      <combobox
        v-model="filterOption"
        class="filter-combobox"
        :options="comboboxFilterOptions"
        :input-style="inputStyles"
        size="sm"
      >
        <template v-slot="slotProps">
          <p class="filter-value">
            {{ slotProps.option }}
          </p>
        </template>
      </combobox>
      <combobox
        v-model="filterValue"
        class="filter-combobox"
        item-text="name"
        item-value="id"
        :options="comboboxValueOptions"
        :input-style="inputStyles"
        size="sm"
      >
        <template v-slot="slotProps">
          <p class="filter-value">
            <code>{{ slotProps.option.id }}</code>
            {{ slotProps.option.name }}
          </p>
        </template>
      </combobox>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex"
import Combobox from "./Combobox"
import TapestryApi from "../services/TapestryAPI"

const filterOptions = {
  AUTHOR: "author",
}

export default {
  name: "tapestry-filter",
  components: {
    Combobox,
  },
  data() {
    return {
      allContributors: null,
      isActive: false,
      filterOption: "",
      filterValue: "",
    }
  },
  computed: {
    ...mapState(["nodes"]),
    inputStyles() {
      return {
        borderRadius: "4px",
        width: "60%",
      }
    },
    isFilterSelected() {
      return this.filterOption !== ""
    },
    comboboxFilterOptions() {
      return Object.values(filterOptions)
    },
    comboboxValueOptions() {
      switch (this.filterOption) {
        case filterOptions.AUTHOR: {
          return this.allContributors !== null
            ? Object.values(this.allContributors)
            : [
                ...new Map(
                  Object.values(this.nodes).map(node => [
                    node.author.id,
                    node.author,
                  ])
                ).values(),
              ]
        }
        default:
          return []
      }
    },
    visibleNodes() {
      if (this.isActive && this.activeFilterOption && this.activeFilterValue) {
        switch (this.activeFilterOption) {
          case filterOptions.AUTHOR: {
            return Object.values(this.nodes)
              .filter(node => node.author.id == this.activeFilterValue)
              .map(node => node.id)
          }
          default:
            break
        }
      }
      return Object.keys(this.nodes)
    },
  },
  watch: {
    isActive(isActive) {
      if (isActive) {
        this.updateVisibleNodes(this.visibleNodes)
      } else {
        this.updateVisibleNodes(Object.keys(this.nodes).map(id => parseInt(id, 10)))
      }
    },
    visibleNodes(nodes) {
      if (this.isActive) {
        this.updateVisibleNodes(nodes)
      }
    },
    async $route(to, from) {
      if (from.query && from.query.q && from.query.q !== undefined) {
        this.refetchTapestryData()
      }
      if (to.query && to.query.q && to.query.q !== undefined) {
        this.refetchTapestryData(to.query.q)
      }
    },
  },
  async created() {
    if (wpData.wpCanEditTapestry === "1") {
      const tapestryApi = new TapestryApi(wpPostId)
      this.allContributors = await tapestryApi.getAllContributors()
    }
  },
  methods: {
    ...mapMutations(["updateVisibleNodes"]),
    ...mapActions(["refetchTapestryData"]),
    toggleFilter() {
      if (this.isActive) {
        this.filterOption = ""
        this.filterValue = ""
      }
      this.isActive = !this.isActive
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
