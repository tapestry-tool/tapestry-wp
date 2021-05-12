<template>
  <g :transform="`translate(${node.coordinates.x}, ${node.coordinates.y})`">
    <foreignObject :width="width" :height="height" :x="x" :y="y">
      <div class="tapestry-tooltip" :style="flexPosition">
        <locked-text class="tapestry-tooltip-content" :node="node" />
      </div>
    </foreignObject>
    <polygon class="tooltip-pointer" :points="points" fill="black"></polygon>
  </g>
</template>

<script>
import LockedText from "@/components/common/LockedText"

export default {
  components: {
    LockedText,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    viewBox: {
      type: String,
      required: true,
    },
  },
  computed: {
    radius() {
      if (this.node.nodeType === "") {
        return 0
      }
      if (this.node.id === this.selectedNodeId) {
        return 210
      }
      if (this.node.nodeType === "grandchild") {
        return 40
      }
      return 140
    },
    height() {
      return this.radius * 2
    },
    width() {
      return Math.min(this.radius * 2 + 48, 400)
    },
    x() {
      return -this.width / 2
    },
    y() {
      return this.onBottom ? this.radius + 27.5 + 10 : -(this.radius * 3 + 27.5 + 20)
    },
    points() {
      const yOffset = this.onBottom
        ? this.y - this.height - 75
        : -this.y - this.height
      const points = this.onBottom
        ? [
            [-16, 16 - yOffset],
            [16, 16 - yOffset],
            [0, -16 - yOffset],
          ]
        : [
            [-16, -16 - yOffset],
            [16, -16 - yOffset],
            [0, 16 - yOffset],
          ]
      return points.map(point => point.join(",")).join(" ")
    },
    startY() {
      return this.viewBox.split(" ")[1]
    },
    onBottom() {
      return (
        this.node.coordinates.y - this.startY < this.height ||
        this.node.coordinates.y - this.startY - this.height <= window.scrollTop
      )
    },
    flexPosition() {
      return this.onBottom ? "align-items: flex-start;" : "align-items: flex-end;"
    },
  },
}
</script>
