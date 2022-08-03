<template>
  <div class="tapestry-title">
    <div class="title">{{ title }}</div>
    <tapestry-filter v-if="!showMap" style="z-index: 10" />
  </div>
</template>

<script>
import { mapState } from "vuex"
import TapestryFilter from "./Toolbar/TapestryFilter"

export default {
  components: {
    TapestryFilter,
  },
  computed: {
    ...mapState(["settings"]),
    title() {
      return this.settings.title
    },
    showMap() {
      return this.settings.renderMap
    },
  },
  methods: {},
}
</script>

<style lang="scss" scoped>
.tapestry-title {
  position: absolute;
  top: 0;
  left: 0;
  padding: 8px 0 0 5vw;
  height: 36px;
  line-height: 36px;
  display: flex;

  .title {
    font-size: 1.5rem;
  }
}
</style>
