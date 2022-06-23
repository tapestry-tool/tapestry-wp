<template>
  <div>
    <canvas
      ref="minimap"
      :width="viewBox[2]"
      :height="viewBox[3]"
      class="tapestry-minimap"
      :style="{
        width: width + 'px',
        height: height + 'px',
      }"
    ></canvas>
    <canvas
      ref="viewbox"
      :width="viewBox[2]"
      :height="viewBox[3]"
      class="tapestry-minimap"
      :style="{
        width: width + 'px',
        height: height + 'px',
      }"
    ></canvas>
  </div>
</template>

<script>
import Helpers from "@/utils/Helpers"
import { mapState } from "vuex"
export default {
  name: "tapestry-minimap",
  props: {
    viewBox: {
      type: Array,
      required: true,
    },
    scale: {
      type: Number,
      required: true,
    },
    offset: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState(["nodes", "links", "maxLevel"]),
    aspectRatio() {
      return this.viewBox[2] / this.viewBox[3]
    },
    width() {
      return this.height * this.aspectRatio
    },
    height() {
      return 300
    },
  },
  watch: {
    nodes() {
      this.drawMinimap()
    },
    links() {
      this.drawMinimap()
    },
    scale() {
      this.drawView()
    },
    offset: {
      handler() {
        this.drawView()
      },
      deep: true,
    },
  },
  mounted() {
    this.drawMinimap()
  },
  updated() {
    console.log("updated")
    this.drawMinimap()
  },
  methods: {
    drawView() {
      if (this.$refs.viewbox) {
        const canvas = this.$refs.viewbox
        const c = canvas.getContext("2d")

        c.clearRect(0, 0, this.viewBox[2], this.viewBox[3])

        const viewX = this.offset.x / this.scale
        const viewY = this.offset.y / this.scale
        const viewWidth = this.viewBox[2] / this.scale
        const viewHeight = this.viewBox[3] / this.scale
        c.strokeStyle = "#11a6d8"
        c.lineWidth = this.viewBox[2] * 0.01
        c.strokeRect(viewX, viewY, viewWidth, viewHeight)
      }
    },
    drawMinimap() {
      console.log("drawMinimap")
      if (this.$refs.minimap) {
        const canvas = this.$refs.minimap
        const c = canvas.getContext("2d")

        // 1. draw background
        c.fillStyle = "white"
        c.fillRect(0, 0, this.viewBox[2], this.viewBox[3])

        // 2. draw links
        for (const link of this.links) {
          const [initialPoint, ...points] = Helpers.getMinimapLinePoints(
            this.nodes[link.source],
            this.nodes[link.target],
            this.maxLevel
          ).map(this.transformCoordinates)
          c.beginPath()
          c.moveTo(initialPoint.x, initialPoint.y)
          for (const point of points) {
            c.lineTo(point.x, point.y)
          }
          c.closePath()
          c.fillStyle = "#999999"
          c.fill()
        }

        // 3. draw nodes
        for (const id in this.nodes) {
          const node = this.nodes[id]
          const { x, y } = this.transformCoordinates(node.coordinates)
          const radius = Helpers.getNodeBaseRadius(node.level, this.maxLevel)
          c.beginPath()
          c.arc(x, y, radius, 0, Math.PI * 2)
          c.fillStyle = node.backgroundColor
          c.fill()
        }

        this.drawView()
      } else {
        setTimeout(() => {
          this.drawMinimap()
        }, 100)
      }
    },
    transformCoordinates(coordinates) {
      return {
        x: coordinates.x - this.viewBox[0],
        y: coordinates.y - this.viewBox[1],
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.tapestry-minimap {
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>
