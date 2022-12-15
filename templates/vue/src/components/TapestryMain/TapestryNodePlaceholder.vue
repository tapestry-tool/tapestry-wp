<template>
  <transition name="fade">
    <circle
      v-show="show"
      ref="circle"
      :transform="
        `translate(${coordinates.x}, ${coordinates.y}) scale(${downScale *
          nodeScale})`
      "
      :fill="fill"
      :style="{
        filter: dropShadow,
      }"
      @click="$emit('click')"
    ></circle>
  </transition>
</template>

<script>
import * as d3 from "d3"
import { mapState } from "vuex"
import Helpers from "@/utils/Helpers"

export default {
  name: "tapestry-node-placeholder",
  props: {
    scale: {
      type: Number,
      required: true,
    },
    downScale: {
      type: Number,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
    coordinates: {
      type: Object,
      required: true,
    },
    level: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      transitioning: false,
      node: Helpers.createDefaultNode(),
    }
  },
  computed: {
    ...mapState(["maxLevel"]),
    nodeScale() {
      return Helpers.getNodeScale(this.level, this.scale)
    },
    radius() {
      return Helpers.getNodeBaseRadius(this.level)
    },
    fill() {
      return Helpers.darkenColor(
        this.node.backgroundColor,
        this.level,
        this.maxLevel
      )
    },
    dropShadow() {
      const { offset, blur, opacity } = Helpers.getDropShadow(
        this.level,
        this.maxLevel
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
circle {
  opacity: 0.6;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
