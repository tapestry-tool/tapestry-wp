<template>
  <div class="depth-indicator-container">
    <depth-slider v-show="!showMap && hasDepth"></depth-slider>
  </div>
</template>

<script>
import { mapState } from "vuex"
import DepthSlider from "./DepthSlider"

export default {
  name: "depth-indicator",
  components: {
    DepthSlider,
  },
  computed: {
    ...mapState(["settings", "maxLevel"]),
    hasDepth() {
      return this.maxLevel > 1 && this.settings.defaultDepth > 0
    },
    showMap() {
      return this.settings.renderMap
    },
  },
  mounted() {},
  beforeDestroy() {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.depth-indicator-container {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 0 0.5rem 0.5rem 0;
}
</style>
