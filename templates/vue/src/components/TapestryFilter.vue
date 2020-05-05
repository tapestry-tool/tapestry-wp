<template>
  <div class="filter">
    <button>
      <i class="fas fa-search"></i>
    </button>
    <combobox
      v-if="isActive"
      :options="comboboxFilterOptions"
      :value="activeFilterOption"
      @input="updateFilterOption"
    ></combobox>
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
    activeFilterOption() {
      const query = this.$route.query
      return query.by || null
    },
    comboboxFilterOptions() {
      return Object.values(filterOptions)
    },
  },
  methods: {
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
