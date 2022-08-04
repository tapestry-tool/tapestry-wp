<template>
  <div class="depth-indicator-container">
    <svg class="layer-indicator">
      <defs>
        <rect
          id="indicator-layer"
          x="0"
          y="0"
          width="40"
          height="30"
          transform="rotate(-30) translate(-5 35) skewX(30)"
          fill-opacity="0.9"
        />
      </defs>
      <use href="#indicator-layer" x="0" y="40" fill="#C2C2C2" />
      <use href="#indicator-layer" x="0" y="20" fill="#6F8699" />
      <use
        href="#indicator-layer"
        x="0"
        y="0"
        fill="#6F8699"
        stroke="#49CFFF"
        stroke-width="2"
      />
    </svg>
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
  width: 140px;
  height: 160px;
}

.layer-indicator {
  position: absolute;
  right: 40px;
  bottom: 0;
  width: 100px;
  height: 160px;
}
</style>
