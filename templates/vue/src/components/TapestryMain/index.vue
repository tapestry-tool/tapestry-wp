<template>
  <main id="tapestry" ref="app" :style="background" :class="{ panning: isPanning }">
    <div v-if="empty">
      <root-node-button v-if="canEdit" @click="addRootNode"></root-node-button>
      <div v-else class="empty-message">The requested Tapestry is empty.</div>
    </div>
    <svg v-else id="vue-svg" :viewBox="computedViewBox">
      <defs>
        <filter
          v-for="i in maxLevel"
          :id="'shadow-' + i"
          :key="i"
          y="-10%"
          height="200%"
          x="-10%"
          width="200%"
        >
          <!-- <feDropShadow :dx="(2**i)*3" :dy="(2**i)*3" stdDeviation="4" flood-opacity="0.2" /> -->
          <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
          <feOffset
            :dx="3 * (maxLevel - i) * scale"
            :dy="3 * (maxLevel - i) * scale"
          />
          <feComponentTransfer>
            <feFuncA type="linear" :slope="Math.max(0.4 - i * 0.05, 0.1)" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g class="links">
        <tapestry-link
          v-for="link in links"
          :key="`${link.source}-${link.target}`"
          :source="nodes[link.source]"
          :target="nodes[link.target]"
          :scale="scale"
        ></tapestry-link>
      </g>
      <g v-if="dragSelectEnabled && dragSelectReady" class="nodes">
        <tapestry-node
          v-for="(node, id) in nodes"
          :key="id"
          :node="node"
          :scale="scale"
          class="node"
          :class="{ selectable: true }"
          :data-id="id"
          :root="id == selectedId"
          @dragend="updateViewBox"
          @mouseover="handleMouseover(id)"
          @mouseleave="activeNode = null"
          @mounted="dragSelectEnabled ? updateSelectableNodes(node) : null"
        ></tapestry-node>
      </g>
      <locked-tooltip
        v-if="activeNode"
        :node="nodes[activeNode]"
        :viewBox="computedViewBox"
      ></locked-tooltip>
    </svg>
  </main>
</template>

<script>
import DragSelectModular from "@/utils/dragSelectModular"
import { mapMutations, mapState } from "vuex"
import TapestryNode from "./TapestryNode"
import TapestryLink from "./TapestryLink"
import RootNodeButton from "./RootNodeButton"
import LockedTooltip from "./LockedTooltip"
import Helpers from "@/utils/Helpers"
import ZoomPanHelper from "@/utils/ZoomPanHelper"
import { names } from "@/config/routes"
import * as wp from "@/services/wp"

export default {
  components: {
    TapestryNode,
    TapestryLink,
    RootNodeButton,
    LockedTooltip,
  },
  data() {
    return {
      dragSelectReady: false,
      activeNode: null,

      viewBox: [2200, 2700, 1600, 1100],
      scale: 1,
      offset: { x: 0, y: 0 },
      appDimensions: null,
      zoomPanHelper: null,
      isPanning: false,
    }
  },
  computed: {
    ...mapState(["nodes", "links", "selection", "settings", "rootId", "maxLevel"]),
    computedViewBox() {
      // return this.viewBox.join(" ")
      return `${this.viewBox[0] + this.offset.x} ${this.viewBox[1] +
        this.offset.y} ${this.viewBox[2]} ${this.viewBox[3]}`
    },
    background() {
      return this.settings.backgroundUrl
    },
    canEdit() {
      return wp.canEditTapestry()
    },
    empty() {
      return Object.keys(this.nodes).length === 0
    },
    selectedId() {
      return Number(this.$route.params.nodeId)
    },
    dragSelectEnabled() {
      return !this.settings.renderMap
    },
    editableNodes() {
      return this.nodes.length
        ? this.nodes.filter(node => this.nodeIsEditable(node))
        : this.nodes
    },
  },
  watch: {
    background: {
      immediate: true,
      handler(background) {
        document.body.style.backgroundImage = background ? `url(${background})` : ""
      },
    },
    selectedId: {
      immediate: true,
      handler(nodeId) {
        if (this.$route.name === names.APP && !this.nodes.hasOwnProperty(nodeId)) {
          this.$router.replace(
            Object.keys(this.nodes).length === 0
              ? { path: "/", query: this.$route.query }
              : {
                  name: names.APP,
                  params: { nodeId: this.rootId },
                  query: this.$route.query,
                }
          )
        }
      },
    },
  },
  created() {
    const { scale, x, y } = this.$route.query
    if (scale && !isNaN(scale)) {
      this.scale = Math.max(Number(scale), 1)
    }
    if (x && !isNaN(x)) {
      this.offset.x = Number(x)
    }
    if (y && !isNaN(y)) {
      this.offset.y = Number(y)
    }
  },
  mounted() {
    if (this.dragSelectEnabled) {
      // DragSelectModular.initializeDragSelect(this.$refs.app, this, this.nodes)
    }
    this.updateViewBox()
    this.dragSelectReady = true

    this.zoomPanHelper = new ZoomPanHelper(
      "tapestry",
      (delta, x, y) => {
        delta *= 0.8
        const newScale = Math.max(this.scale + delta, 1)
        const scaleChange = newScale / this.scale

        if (!this.appDimensions) {
          this.fetchAppDimensions()
        }
        const { width, height } = this.appDimensions

        const relativeX = (x / width) * this.viewBox[2]
        const relativeY = (y / height) * this.viewBox[3]
        const absoluteX = relativeX + this.viewBox[0] + this.offset.x
        const absoluteY = relativeY + this.viewBox[1] + this.offset.y

        // update the viewBox to match the scaled coordinates
        this.viewBox[0] *= scaleChange
        this.viewBox[1] *= scaleChange

        const newAbsoluteX = absoluteX * scaleChange
        const newAbsoluteY = absoluteY * scaleChange
        const newRelativeX = newAbsoluteX - this.viewBox[0] - this.offset.x
        const newRelativeY = newAbsoluteY - this.viewBox[1] - this.offset.y

        // update the offset so that it zooms in to the cursor position
        this.offset.x += newRelativeX - relativeX
        this.offset.y += newRelativeY - relativeY

        this.scale = newScale
      },
      () => {
        this.updateScale()
        this.fetchAppDimensions()
      },
      (dx, dy) => {
        if (!this.appDimensions) {
          this.fetchAppDimensions()
        }
        if (!this.isPanning) {
          this.isPanning = true
        }
        const { width, height } = this.appDimensions
        dx = (dx / width) * this.viewBox[2]
        dy = (dy / height) * this.viewBox[3]
        this.offset.x -= dx
        this.offset.y -= dy
      },
      () => {
        this.isPanning = false
        this.updateOffset()
        this.fetchAppDimensions()
      }
    )
    this.zoomPanHelper.register()
  },
  beforeDestroy() {
    this.zoomPanHelper.unregister()
  },
  methods: {
    ...mapMutations(["select", "unselect", "clearSelection"]),
    addRootNode() {
      this.$root.$emit("add-node", null)
    },
    fetchAppDimensions() {
      const { width, height } = this.$refs.app.getBoundingClientRect()
      this.appDimensions = {
        width,
        height,
      }
    },
    updateScale() {
      this.$router.push({
        ...this.$route,
        query: { ...this.$route.query, scale: this.scale.toFixed(2) },
      })
      this.updateOffset()
    },
    updateOffset() {
      this.$router.push({
        ...this.$route,
        query: {
          ...this.$route.query,
          x: this.offset.x.toFixed(4),
          y: this.offset.y.toFixed(4),
        },
      })
    },
    updateSelectableNodes() {
      DragSelectModular.updateSelectableNodes()
    },
    nodeIsEditable(node) {
      return wp.isLoggedIn() && Helpers.hasPermission(node, "edit")
    },
    updateViewBox() {
      const MAX_RADIUS = 240
      const MIN_TAPESTRY_WIDTH_FACTOR = 1.5
      if (this.$refs.app) {
        // check if <main> in TapestryMain has rendered
        const { width, height } = this.$refs.app.getBoundingClientRect()
        const { x0, y0, x, y } = this.getNodeDimensions()

        const tapestryDimensions = {
          startX: 0,
          startY: 0,
          width,
          height,
        }
        if (x > width || y > height) {
          tapestryDimensions.startX = x0 - MAX_RADIUS * 1.25
          tapestryDimensions.startY = y0 - MAX_RADIUS * 1.25
          tapestryDimensions.width = x
          tapestryDimensions.height = y
        }
        const windowWidth = Helpers.getBrowserWidth()
        // Center the nodes if there is not enough of them to fill the width of the screen
        if (
          tapestryDimensions.width - tapestryDimensions.startX - MAX_RADIUS * 1.25 <
          windowWidth
        ) {
          tapestryDimensions.startX -=
            (windowWidth - tapestryDimensions.width + tapestryDimensions.startX) /
              2 +
            MAX_RADIUS
        }
        tapestryDimensions.width = tapestryDimensions.width + MAX_RADIUS * 1.25
        tapestryDimensions.height = tapestryDimensions.height + MAX_RADIUS * 1.25

        const MIN_WIDTH = Helpers.getBrowserWidth() * MIN_TAPESTRY_WIDTH_FACTOR
        const MIN_HEIGHT = Helpers.getBrowserHeight() * MIN_TAPESTRY_WIDTH_FACTOR

        this.viewBox = [
          tapestryDimensions.startX * this.scale,
          tapestryDimensions.startY * this.scale,
          Math.max(tapestryDimensions.width - tapestryDimensions.startX, MIN_WIDTH),
          Math.max(
            tapestryDimensions.height - tapestryDimensions.startY,
            MIN_HEIGHT
          ),
        ]
        // this.viewBox = `${tapestryDimensions.startX} ${
        //   tapestryDimensions.startY
        // } ${Math.max(
        //   tapestryDimensions.width - tapestryDimensions.startX,
        //   MIN_WIDTH
        // )} ${Math.max(
        //   tapestryDimensions.height - tapestryDimensions.startY,
        //   MIN_HEIGHT
        // )}`
      }
    },
    getNodeDimensions() {
      const box = {
        x0: 30000,
        y0: 30000,
        x: 0,
        y: 0,
      }
      for (const node of Object.values(this.nodes)) {
        if (node.nodeType !== "") {
          const { x, y } = node.coordinates
          box.x0 = Math.min(x, box.x0)
          box.y0 = Math.min(y, box.y0)
          box.x = Math.max(x, box.x)
          box.y = Math.max(y, box.y)
        }
      }

      return box
    },
    handleMouseover(id) {
      const node = this.nodes[id]
      if (
        !node.accessible &&
        node.nodeType !== "grandchild" &&
        node.nodeType !== ""
      ) {
        this.activeNode = id
      }
    },
  },
}
</script>

<style lang="scss" scoped>
#tapestry.panning {
  cursor: move;
}

#app-container {
  position: relative;
  transform: scale(1);
  transform-origin: top left;
  transition: all 0.2s ease-out;
  width: 100%;
  z-index: 0;

  @media screen and (min-width: 500px) {
    width: calc(100% - 2.5em);

    &.sidebar-open {
      width: calc(100% - min(400px, max(300px, 25vw)) - 2.5em);
      padding-right: 0;

      .toolbar {
        padding-right: 1.5vw;
      }
    }
  }
  #tapestry {
    .empty-message {
      margin: 30vh auto;
    }
    svg {
      position: relative;
    }
  }
}
</style>

<style lang="scss">
#app {
  background-size: cover;
}
#app-container .btn-link {
  background: transparent;
}
</style>
