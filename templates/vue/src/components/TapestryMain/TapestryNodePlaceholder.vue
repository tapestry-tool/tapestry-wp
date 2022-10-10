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
      @click="handleClick"
    ></circle>
  </transition>
</template>

<script>
import * as d3 from "d3"
import { mapState } from "vuex"
import Helpers from "@/utils/Helpers"
import { names } from "@/config/routes"

export default {
  name: "tapestry-node-placeholder",
  props: {
    scale: {
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
  },
  data() {
    return {
      transitioning: false,
      node: Helpers.createDefaultNode(),
    }
  },
  computed: {
    ...mapState(["maxLevel"]),
    radius() {
      return Helpers.getNodeRadius(this.node.level, this.scale)
    },
    fill() {
      return Helpers.darkenColor(
        this.node.backgroundColor,
        this.node.level,
        this.maxLevel
      )
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
  methods: {
    handleClick() {
      this.$router.push({
        name: names.MODAL,
        params: {
          nodeId: 0,
          type: "add",
          tab: "content",
        },
        query: {
          ...this.$route.query,
          nodeX: this.coordinates.x.toFixed(4),
          nodeY: this.coordinates.y.toFixed(4),
        },
      })
    },
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
