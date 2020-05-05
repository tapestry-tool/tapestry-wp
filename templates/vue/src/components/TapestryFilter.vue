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
    </div>
  </div>
</template>

<script>
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
  },
  methods: {
    toggleFilter() {
      this.isActive ? this.$router.go(-1) : this.$router.push("/filter")
    },
    updateFilterOption(opt) {
      this.$router.replace({ query: opt ? { by: opt } : {} })
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
