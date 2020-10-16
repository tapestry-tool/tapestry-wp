<template>
  <g>
    <circle
      ref="track"
      class="track"
      :stroke-width="width"
      :stroke="locked ? '#999' : strokeColor"
      :stroke-dasharray="status === 'publish' ? 0 : dasharraySize"
    ></circle>
    <path
      v-show="!locked && progress > 0 && status === 'publish'"
      ref="path"
      class="bar"
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
    draft: {
      type: Boolean,
      required: false,
      default: false,
    },
    status: {
      type: String,
      required: false,
      default: "publish",
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
      return this.status === "publish" ? 20 : 5
    },
    dasharraySize() {
      return this.radius / 10
    },
    strokeColor() {
      switch (this.status) {
        case "publish":
          return "currentColor"
        case "draft":
          return "#999"
        case "submitted":
          return "blue"
        case "reject":
          return "red"
        default:
          return "currentColor"
      }
    },
  },
  watch: {
    radius(radius, oldRadius) {
      d3.select(this.$refs.track)
        .transition()
        .duration(750)
        .ease(d3.easePolyOut)
        .attr("r", Math.max(radius - this.width / 2, 0))

      d3.select(this.$refs.path)
        .transition()
        .duration(750)
        .ease(d3.easePolyOut)
        .attrTween("d", () => {
          const interpolate = d3.interpolate(oldRadius, radius)
          return t => {
            const rad = interpolate(t)
            return d3.arc()({
              startAngle: 0,
              endAngle: this.progress * 2 * Math.PI,
              innerRadius: Math.max(rad - this.width, 0),
              outerRadius: rad,
            })
          }
        })
    },
    progress(progress, oldProgress) {
      d3.select(this.$refs.path)
        .transition()
        .duration(750)
        .ease(d3.easePolyOut)
        .attrTween("d", () => {
          const interpolate = d3.interpolate(oldProgress, progress)
          return t => {
            const currentProgress = interpolate(t)
            return d3.arc()({
              startAngle: 0,
              endAngle: currentProgress * 2 * Math.PI,
              innerRadius: this.radius - this.width,
              outerRadius: this.radius,
            })
          }
        })
    },
  },
  mounted() {
    const track = this.$refs.track
    track.setAttribute("r", Math.max(this.radius - this.width / 2, 0))

    this.$refs.path.setAttribute(
      "d",
      d3.arc()({
        startAngle: 0,
        endAngle: this.progress * 2 * Math.PI,
        innerRadius: this.radius - this.width,
        outerRadius: this.radius,
      })
    )
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
