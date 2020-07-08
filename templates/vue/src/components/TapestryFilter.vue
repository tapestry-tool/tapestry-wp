<template>
  <div class="filter">
    <button @click="toggleFilter">
      <i class="fas fa-search"></i>
    </button>
    <div :class="['input-container', { 'input-container-show': isActive }]">
      <combobox
        class="filter-combobox"
        :options="comboboxFilterOptions"
        :value="activeFilterOption"
        :input-style="inputStyles"
        size="sm"
        @input="updateFilterOption"
      >
        <template v-slot="slotProps">
          <p class="filter-value">
            {{ slotProps.option }}
          </p>
        </template>
      </combobox>
      <combobox
        class="filter-combobox"
        item-text="name"
        item-value="id"
        :options="comboboxValueOptions"
        :value="activeFilterValue"
        :input-style="inputStyles"
        size="sm"
        @input="updateFilterValue"
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
import { mapState, mapActions } from "vuex"
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
    isActive() {
      return this.$route.path.includes("filter")
    },
    isFilterSelected() {
      return this.activeFilterOption !== null
    },
    activeFilterOption() {
      const query = this.$route.query
      return query.by || null
    },
    comboboxFilterOptions() {
      return Object.values(filterOptions)
    },
    activeFilterValue() {
      return this.$route.query.q || null
    },
    comboboxValueOptions() {
      switch (this.activeFilterOption) {
        case filterOptions.AUTHOR: {
          // console.log(this.nodes.map(node => [node.author.id, node.author]))
          return this.allContributors !== null
            ? Object.values(this.allContributors)
            : [
                ...new Map(
                  this.nodes.map(node => [node.author.id, node.author])
                ).values(),
              ]
        }
        default:
          return []
      }
    },
  },
  watch: {
    async $route(to, from) {
      if (from.query && from.query.q && from.query.q !== undefined) {
        this.refetchTapestryData()
      }
      if (to.query && to.query.q && to.query.q !== undefined) {
        this.refetchTapestryData(to.query.q)
      }
      thisTapestryTool.updateVisibleNodes(
        to.fullPath.slice(1),
        from.fullPath.slice(1)
      )
    },
  },
  async created() {
    if (wpApiSettings && wpApiSettings.wpCanEditTapestry === "1") {
      const tapestryApi = new TapestryApi(wpPostId)
      this.allContributors = await tapestryApi.getAllContributors()
    }
  },
  methods: {
    ...mapActions(["refetchTapestryData"]),
    toggleFilter() {
      this.isActive
        ? this.$router.push(`/`)
        : this.$router.push(`/filter?by=${this.comboboxFilterOptions[0]}`)
    },
    updateFilterOption(opt) {
      this.$router.push({
        query: { by: opt !== null ? opt : this.comboboxFilterOptions[0] },
      })
    },
    updateFilterValue(val) {
      const newQuery =
        val !== null
          ? { ...this.$route.query, q: val }
          : { by: this.$route.query.by }
      this.$router.push({ query: newQuery })
    },
  },
}
</script>

<style lang="scss" scoped>
.filter {
  display: flex;
  position: absolute;
  top: 0;
  left: 10vw;
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
