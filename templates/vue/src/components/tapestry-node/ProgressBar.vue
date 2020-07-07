<template>
  <g>
    <circle
      class="track"
      :cx="x"
      :cy="y"
      :r="radius - width / 2"
      :stroke-width="width"
      :stroke="locked ? '#999' : 'currentColor'"
    ></circle>
    <path
      v-if="!locked"
      class="bar"
      :d="arc"
      :transform="`translate(${x}, ${y})`"
    ></path>
  </g>
</template>

<script>
import * as d3 from "d3"

export default {
  props: {
    locked: {
      type: Boolean,
      required: false,
      default: false,
    },
    progress: {
      type: Number,
      required: true,
    },
    radius: {
      type: Number,
      required: true,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
  },
  computed: {
    arc() {
      return d3.arc()({
        startAngle: 0,
        endAngle: this.progress * 2 * Math.PI,
        innerRadius: this.radius - this.width,
        outerRadius: this.radius,
      })
    },
    width() {
      return 20
    },
  },
}
</script>

<style lang="scss" scoped>
.bar {
  stroke: #11a6d8;
}

.track {
  fill-opacity: 0;
  pointer-events: none;
}
</style>
