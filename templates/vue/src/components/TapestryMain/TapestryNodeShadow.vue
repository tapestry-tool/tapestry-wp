<template>
  <transition name="fade">
    <circle
      v-show="show"
      ref="circle"
      :transform="`translate(${coordinates.x}, ${coordinates.y})`"
      :fill="fill"
      :style="{
        filter: dropShadow,
      }"
    ></circle>
  </transition>
</template>

<script>
import * as d3 from "d3"
import { mapGetters, mapState } from "vuex"
import Helpers from "@/utils/Helpers"

export default {
  name: "tapestry-node",
  props: {
    node: {
      type: Object,
      required: true,
    },
    root: {
      type: Boolean,
      required: true,
    },
    scale: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      transitioning: false,
    }
  },
  computed: {
    ...mapState(["selection", "settings", "maxLevel", "currentDepth"]),
    ...mapGetters(["isVisible"]),
    show() {
      return this.isVisible(this.node.id) && this.visibility >= 0
    },
    visibility() {
      return Helpers.getNodeVisibility(
        this.node.level,
        this.scale,
        this.currentDepth
      )
    },
    coordinates() {
      return {
        x: this.node.coordinates.x * this.scale,
        y: this.node.coordinates.y * this.scale,
      }
    },
    isGrandChild() {
      return this.visibility <= 0
    },
    radius() {
      if (!this.show) {
        return 0
      }
      const radius =
        Helpers.getNodeRadius(this.node.level, this.scale) * (this.root ? 1.2 : 1)
      return this.isGrandChild ? Math.min(40, radius) : radius
    },
    fill() {
      const showImages = this.settings.hasOwnProperty("renderImages")
        ? this.settings.renderImages
        : true

      const backgroundColor = Helpers.darkenColor(
        this.node.backgroundColor,
        this.node.level,
        this.maxLevel
      )

      if (!this.isGrandChild) {
        if (showImages && this.thumbnailURL) {
          return `url(#node-image-${this.node.id})`
        } else {
          return backgroundColor
        }
      } else if (this.selected) {
        return "var(--highlight-color)"
      } else {
        return backgroundColor
      }
    },
    thumbnailURL() {
      return !this.node.unlocked && this.node.lockedImageURL
        ? this.node.lockedImageURL
        : this.node.imageURL
    },
    selected() {
      return this.selection.includes(this.node.id)
    },
    dropShadow() {
      const { offset, blur, opacity } = Helpers.getDropShadow(
        this.node.level,
        this.maxLevel,
        this.scale
      )
      return `drop-shadow(${offset}px ${offset}px ${blur}px rgba(0, 0, 0, ${opacity}))`
    },
  },
  watch: {
    radius(newRadius) {
      d3.select(this.$refs.circle)
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .on("start", () => {
          this.transitioning = true
        })
        .on("end", () => {
          this.transitioning = false
        })
        .attr("r", newRadius)
    },
  },
  mounted() {
    this.$refs.circle.setAttribute("r", this.radius)
  },
}
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
