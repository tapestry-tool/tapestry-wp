<template>
  <div class="filter">
    <button @click="toggleFilter">
      <i class="fas fa-search"></i>
    </button>
    <div v-if="isActive">
      <p>Filter by:</p>
      <combobox
        :options="comboboxFilterOptions"
        :value="activeFilterOption"
        @input="updateFilterOption"
      ></combobox>
      <combobox
        v-if="isFilterSelected"
        item-text="name"
        item-value="id"
        :options="comboboxValueOptions"
        :value="activeFilterValue"
        @input="updateFilterValue"
      >
        <template v-slot="slotProps">
          <p>
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
          return Array.from(authors.values())
        }
        default:
          return []
      }
    },
  },
  methods: {
    toggleFilter() {
      this.isActive ? this.$router.go(-1) : this.$router.push("/filter")
    },
    updateFilterOption(opt) {
      this.$router.replace({ query: opt ? { by: opt } : {} })
    },
    updateFilterValue(val) {
      const newQuery = val ? { ...this.$route.query, q: val } : this.$route.query
      this.$router.replace({ query: newQuery })
    },
  },
}
</script>

<style lang="scss" scoped>
.filter {
  position: absolute;
  top: -60px;
  left: 10vw;
}
</style>
