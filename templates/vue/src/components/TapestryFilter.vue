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
        v-if="isFilterSelected"
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
import { mapState } from "vuex"
import Combobox from "./Combobox"

const filterOptions = {
  AUTHOR: "author",
}

export default {
  name: "tapestry-filter",
  components: {
    Combobox,
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
          const authors = new Map(
            this.nodes.map(node => [node.author.id, node.author])
          )
          return [...authors.values()]
        }
        default:
          return []
      }
    },
  },
  watch: {
    $route(to, from) {
      thisTapestryTool.updateVisibleNodes(
        to.fullPath.slice(1),
        from.fullPath.slice(1)
      )
    },
  },
  methods: {
    toggleFilter() {
      this.isActive
        ? this.$router.go(-1)
        : this.$router.push(`/filter?by=${this.comboboxFilterOptions[0]}`)
    },
    updateFilterOption(opt) {
      this.$router.replace({
        query: { by: opt !== null ? opt : this.comboboxFilterOptions[0] },
      })
    },
    updateFilterValue(val) {
      const newQuery =
        val !== null
          ? { ...this.$route.query, q: val }
          : { by: this.$route.query.by }
      this.$router.replace({ query: newQuery })
    },
  },
}
</script>

<style lang="scss" scoped>
.filter {
  display: flex;
  position: absolute;
  top: -50px;
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
