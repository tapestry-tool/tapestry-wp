<template>
  <g>
    <circle
      v-show="reviewStatus || status === 'draft'"
      ref="track"
      class="track"
      :stroke-width="width"
      :stroke="locked ? '#999' : strokeColor"
      :stroke-dasharray="dasharraySize"
    ></circle>
  </g>
</template>

<script>
import * as d3 from "d3"
import { nodeStatus } from "@/utils/constants"

export default {
  props: {
    locked: {
      type: Boolean,
      required: false,
      default: false,
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
    reviewStatus: {
      type: String,
      required: false,
      default: "",
    },
  },
  computed: {
    width() {
      return 10
    },
    spacing() {
      return 5
    },
    dasharraySize() {
      if (this.reviewStatus) return 0
      return 22.2
    },
    strokeColor() {
      if (this.reviewStatus) {
        switch (this.reviewStatus) {
          case nodeStatus.SUBMIT:
            return "#FFC107"
          case nodeStatus.ACCEPT:
            return "#5CE601"
          case nodeStatus.REJECT:
            return "#CC444B"
          default:
            return "currentColor"
        }
      } else {
        switch (this.status) {
          case nodeStatus.PUBLISH:
            return "currentColor"
          case nodeStatus.DRAFT:
            return "#999"
          default:
            return "currentColor"
        }
      }
    },
  },
  watch: {
    radius(radius, oldRadius) {
      d3.select(this.$refs.track)
        .transition()
        .duration(750)
        .ease(d3.easePolyOut)
        .attr("r", Math.max(radius + this.spacing + this.width / 2, 0))

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
              innerRadius: Math.max(rad + this.spacing, 0),
              outerRadius: rad + this.spacing + this.width,
            })
          }
        })
    },
  },
  mounted() {
    const track = this.$refs.track
    track.setAttribute("r", Math.max(this.radius + this.spacing + this.width / 2, 0))
  },
}
</script>

<style lang="scss" scoped>
.track {
  fill-opacity: 0;
  pointer-events: none;
}
</style>
