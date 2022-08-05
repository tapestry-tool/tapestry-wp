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
    <div data-qa="close-minimap" class="minimap-button">
      <button @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <depth-indicator
      :style="{
        right: width + 'px',
      }"
      :scale="scale"
    ></depth-indicator>
  </div>
</template>

<script>
import Helpers from "@/utils/Helpers"
import { mapState } from "vuex"
import DepthIndicator from "./DepthIndicator"

export default {
  name: "tapestry-minimap",
  components: {
    DepthIndicator,
  },
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
  data() {
    return {
      viewPosition: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      mouseDown: false,
      mouseMoved: false,
      mousePos: false,
    }
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
      return 150
    },
    displayScale() {
      return this.height / this.viewBox[3]
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

    // add event listeners
    const elem = this.$refs.viewbox
    if (elem) {
      elem.addEventListener("mousedown", this.handleMousedown)
      elem.addEventListener("mousemove", this.handleMousemove)
      elem.addEventListener("mouseup", this.handleMouseup)
      elem.addEventListener("mouseleave", this.handleMouseup)
    }
  },
  beforeDestroy() {
    const elem = this.$refs.viewbox
    if (elem) {
      elem.removeEventListener("mousedown", this.handleMousedown)
      elem.removeEventListener("mousemove", this.handleMousemove)
      elem.removeEventListener("mouseup", this.handleMouseup)
      elem.removeEventListener("mouseleave", this.handleMouseup)
    }
  },
  updated() {
    this.drawMinimap()
  },
  methods: {
    drawView() {
      if (this.$refs.viewbox) {
        const c = this.getCanvasContext(this.$refs.viewbox)
        if (!c) {
          return
        }

        c.clearRect(0, 0, this.viewBox[2], this.viewBox[3])
        c.fillStyle = "#8495a188"
        c.fillRect(0, 0, this.viewBox[2], this.viewBox[3])

        const viewX = this.offset.x / this.scale
        const viewY = this.offset.y / this.scale
        const viewWidth = this.viewBox[2] / this.scale
        const viewHeight = this.viewBox[3] / this.scale

        c.strokeStyle = "#000000"
        c.lineWidth = this.viewBox[2] * 0.005
        this.viewPosition = {
          x: viewX,
          y: viewY,
          width: viewWidth,
          height: viewHeight,
        }
        c.clearRect(viewX, viewY, viewWidth, viewHeight)
        c.strokeRect(viewX, viewY, viewWidth, viewHeight)
      }
    },
    drawMinimap() {
      if (this.$refs.minimap) {
        const c = this.getCanvasContext(this.$refs.minimap)
        if (!c) {
          return
        }

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
          c.shadowColor = `rgba(0, 0, 0, ${Math.max(0.5 - node.level * 0.05, 0.2)})`
          c.shadowBlur = Math.max(10 - node.level, 4)
          c.shadowOffsetX = 4 * (this.maxLevel - node.level)
          c.shadowOffsetY = 4 * (this.maxLevel - node.level)
          c.fill()
        }
        c.shadowColor = "rgba(0, 0, 0, 0)"

        this.drawView()
      } else {
        setTimeout(() => {
          this.drawMinimap()
        }, 100)
      }
    },
    getCanvasContext(canvasElement) {
      // ignore errors if canvas context is not supported (e.g. in the unit testing environment)
      try {
        const context = canvasElement.getContext("2d")
        return context
      } catch {
        return null
      }
    },
    transformCoordinates(coordinates) {
      return {
        x: coordinates.x - this.viewBox[0],
        y: coordinates.y - this.viewBox[1],
      }
    },
    handleMousedown(event) {
      this.mouseDown = true
      this.mouseMoved = false
      const x = event.offsetX / this.displayScale
      const y = event.offsetY / this.displayScale
      const mouseInView =
        x >= this.viewPosition.x &&
        x < this.viewPosition.x + this.viewPosition.width &&
        y >= this.viewPosition.y &&
        y < this.viewPosition.y + this.viewPosition.height
      this.mousePos = mouseInView ? { x, y } : null
      // this.$emit("pan-to", {x: event.offsetX, y: event.offsetY})
    },
    handleMousemove(event) {
      this.mouseMoved = true
      if (this.mouseDown && this.mousePos) {
        const x = event.offsetX / this.displayScale
        const y = event.offsetY / this.displayScale
        this.$emit("pan-by", {
          dx: this.mousePos.x - x,
          dy: this.mousePos.y - y,
        })
        this.mousePos.x = x
        this.mousePos.y = y
      }
    },
    handleMouseup(event) {
      if (this.mouseDown && (!this.mouseMoved || !this.mousePos)) {
        const x = event.offsetX / this.displayScale
        const y = event.offsetY / this.displayScale
        this.$emit("pan-to", {
          x,
          y,
        })
      }
      this.mouseDown = false
      this.mouseMoved = false
      this.mousePos = null
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
.minimap-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  height: 2.5rem;
  width: 2.5rem;
  background: var(--bg-color-secondary);
  box-shadow: 0 0 7px 0 var(--bg-color-primary);
  border-radius: 8px;

  button {
    color: var(--text-color-tertiary);
    padding: 0;
    background: none;
    width: 100%;
    height: 100%;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: var(--highlight-color);
    }
  }
}
</style>
