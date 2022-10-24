<template>
  <div v-if="maxLevel > 1" class="depth-indicator-container">
    <svg class="layer-indicator">
      <title id="depth-indicator-title">
        Indicator for your current level
      </title>
      <desc>
        A stack of translucent layers with the current level highlighted. You are
        currently on level
        {{ currentLevel }}. You can see {{ currentDepth }} levels deep.
      </desc>
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
      <use
        v-for="level in layerOrder"
        :key="level"
        href="#indicator-layer"
        x="0"
        :y="getYOffset(level)"
        :fill="getFillColor(level)"
        :stroke="isCurrentLevel(level) ? '#49CFFF' : '#9CACBB'"
        stroke-width="2"
      />
    </svg>
    <depth-slider v-show="!showMap && hasDepth"></depth-slider>
  </div>
</template>

<script>
import Helpers from "@/utils/Helpers"
import { mapState } from "vuex"
import DepthSlider from "./DepthSlider"

export default {
  name: "depth-indicator",
  components: {
    DepthSlider,
  },
  props: {
    scale: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapState(["settings", "maxLevel", "currentDepth"]),
    hasDepth() {
      return this.maxLevel > 1 && this.settings.defaultDepth > 0
    },
    showMap() {
      return this.settings.renderMap
    },
    currentLevel() {
      return Math.min(Helpers.getCurrentLevel(this.scale), this.maxLevel)
    },
    layerOrder() {
      const layers = []
      for (let i = this.maxLevel; i >= 1; i--) {
        layers.push(i)
      }
      return layers
    },
  },
  methods: {
    getYOffset(level) {
      const minOffset = Math.max(0, 50 - (this.maxLevel - 1) * 10)
      const maxOffset = Math.min(100, 50 + (this.maxLevel - 1) * 10)
      return Helpers.mapLevel(level, this.maxLevel, minOffset, maxOffset)
    },
    getFillColor(level) {
      if (this.isCurrentLevel(level)) {
        return "var(--highlight-color)"
      }
      if (this.isVisibleLevel(level)) {
        return "#6F8699"
      }
      return "#C2C2C2"
    },
    isCurrentLevel(level) {
      return this.currentLevel == level
    },
    isVisibleLevel(level) {
      return level < this.currentLevel + this.currentDepth
    },
  },
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
