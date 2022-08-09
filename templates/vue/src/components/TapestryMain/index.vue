<template>
  <main id="tapestry" ref="app" :style="background" :class="{ panning: isPanning }">
    <div v-if="isEmptyTapestry">
      <root-node-button v-if="canEdit"></root-node-button>
      <div v-else class="empty-message">The requested Tapestry is empty.</div>
    </div>
    <template v-else>
      <svg
        id="vue-svg"
        role="application"
        aria-label="Main Tapestry View"
        :viewBox="computedViewBox"
      >
        <g class="links">
          <tapestry-link
            v-for="link in links"
            :key="`${link.source}-${link.target}`"
            :source="nodes[link.source]"
            :target="nodes[link.target]"
            :scale="scale"
          ></tapestry-link>
        </g>
        <g v-if="!dragSelectEnabled || dragSelectReady" class="nodes">
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
            @click="handleNodeClick"
          ></tapestry-node>
        </g>
        <locked-tooltip
          v-if="activeNode"
          :node="nodes[activeNode]"
          :viewBox="computedViewBox"
        ></locked-tooltip>
      </svg>
      <tapestry-minimap
        v-if="showMinimap"
        ref="minimap"
        :view-box="unscaledViewBox"
        :scale="scale"
        :offset="offset"
        @pan-by="handleMinimapPanBy"
        @pan-to="handleMinimapPanTo"
        @close="showMinimap = false"
      ></tapestry-minimap>
    </template>
  </main>
</template>

<script>
import DragSelectModular from "@/utils/dragSelectModular"
import { mapActions, mapGetters, mapMutations, mapState } from "vuex"
import TapestryNode from "./TapestryNode"
import TapestryLink from "./TapestryLink"
import TapestryMinimapButton from "./TapestryMinimap/TapestryMinimapButton"
import TapestryMinimap from "./TapestryMinimap"
import RootNodeButton from "./RootNodeButton"
import LockedTooltip from "./LockedTooltip"
import Helpers from "@/utils/Helpers"
import ZoomPanHelper from "@/utils/ZoomPanHelper"
import { names } from "@/config/routes"
import * as wp from "@/services/wp"
// import { scaleConstants } from "@/utils/constants"

export default {
  components: {
    TapestryNode,
    TapestryLink,
    TapestryMinimapButton,
    TapestryMinimap,
    RootNodeButton,
    LockedTooltip,
  },
  data() {
    return {
      dragSelectReady: false,
      activeNode: null,

      unscaledViewBox: [2200, 2700, 1600, 1100],
      viewBox: [2200, 2700, 1600, 1100],
      scale: 1,
      offset: { x: 0, y: 0 },
      appDimensions: null,
      zoomPanHelper: null,
      isPanning: false,

      showMinimap: true,
    }
  },
  computed: {
    ...mapState([
      "nodes",
      "links",
      "selection",
      "settings",
      "browserDimensions",
      "maxLevel",
      "currentDepth",
      "scaleConstants",
    ]),
    ...mapGetters([
      "isEmptyTapestry",
      "getNode",
      "getInitialNodeId",
      "getCurrentNodeNav",
    ]),
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
    selectedId() {
      return Number(this.$route.params.nodeId)
    },
    dragSelectEnabled() {
      return !Helpers.isTouchEnabledDevice()
    },
    editableNodes() {
      return this.nodes.length
        ? this.nodes.filter(node => this.nodeIsEditable(node))
        : this.nodes
    },
    maxScale() {
      return Math.max(
        (this.scaleConstants.maxNodeSizeToScreen *
          Math.min(this.viewBox[2], this.viewBox[3])) /
          Helpers.getNodeBaseRadius(this.maxLevel, this.maxLevel),
        140 / Helpers.getNodeBaseRadius(this.maxLevel, this.maxLevel)
      )
    },
    routeName() {
      return this.$route.name
    },
  },
  watch: {
    isEmptyTapestry(empty) {
      if (!empty) {
        this.zoomPanHelper.unregister()
        this.zoomPanHelper.register()
      }
    },
    background: {
      immediate: true,
      handler(background) {
        document.body.style.backgroundImage = background ? `url(${background})` : ""
      },
    },
    nodes() {
      this.updateViewBox()
    },
    selectedId: {
      immediate: true,
      handler(nodeId) {
        if (this.$route.name === names.APP && !this.nodes.hasOwnProperty(nodeId)) {
          this.$router.replace(
            this.isEmptyTapestry
              ? { path: "/", query: this.$route.query }
              : {
                  name: names.APP,
                  params: { nodeId: this.getInitialNodeId },
                  query: this.$route.query,
                }
          )
        }
        if (nodeId !== this.getCurrentNodeNav) {
          this.resetNodeNavigation(nodeId)
        }
        this.updateViewBox()
      },
    },
    routeName(newName, oldName) {
      if (newName === names.APP && oldName === names.LIGHTBOX) {
        // TODO: this is not needed anymore due to new lightbox using Bootstrap modal which automatically returns focus to last selected node; remove after testing on a screen reader
        // this.focusSelectedNode()
      }
    },
  },
  created() {
    const { scale, x, y } = this.$route.query
    if (scale && !isNaN(scale)) {
      this.scale = this.clampScale(Number(scale))
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
      // ! disabled drag select in favor of panning
      // DragSelectModular.initializeDragSelect(this.$refs.app, this, this.nodes)
    }
    this.updateViewBox()
    this.dragSelectReady = true

    this.zoomPanHelper = new ZoomPanHelper(
      "tapestry",
      (delta, x, y) => {
        this.handleZoom(delta * this.scaleConstants.zoomSensitivity, x, y)
      },
      () => {
        this.updateScale()
        this.fetchAppDimensions()
      },
      (dx, dy) => {
        this.handlePan(
          dx * this.scaleConstants.panSensitivity,
          dy * this.scaleConstants.panSensitivity
        )
      },
      () => {
        this.isPanning = false
        this.updateOffset()
        this.fetchAppDimensions()
      },
      [this.$refs.minimap.$el]
    )
    this.zoomPanHelper.register()

    this.$refs.app.addEventListener("keydown", this.handleKey)
  },
  beforeDestroy() {
    this.zoomPanHelper && this.zoomPanHelper.unregister()
    this.$refs.app.removeEventListener("keydown", this.handleKey)
  },
  methods: {
    ...mapMutations(["select", "unselect", "clearSelection"]),
    ...mapActions([
      "goToNodeChildren",
      "goToNodeParent",
      "goToNodeSibling",
      "resetNodeNavigation",
    ]),
    clampScale(scale) {
      return Math.max(
        Math.min(scale, this.maxScale),
        this.scaleConstants.minTapestrySizeToScreen
      )
    },
    fetchAppDimensions() {
      const { width, height } = this.$refs.app.getBoundingClientRect()
      this.appDimensions = {
        width,
        height,
      }
    },
    handleZoom(delta, x, y) {
      const newScale = this.clampScale(this.scale + delta)
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
    handlePan(dx, dy) {
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
    handleMinimapPanBy({ dx, dy }) {
      // dx, dy passed here is in viewBox dimensions, not screen pixels; we apply the changes to the offset directly, bypassing the calculations in handlePan
      this.offset.x -= dx * this.scaleConstants.panSensitivity
      this.offset.y -= dy * this.scaleConstants.panSensitivity
      this.zoomPanHelper.onPanEnd()
    },
    handleMinimapPanTo({ x, y }) {
      // x, y is in viewbox coordinates (before scaling)
      // put (x, y) to the center of the view
      const scaledX = x * this.scale
      const scaledY = y * this.scale
      this.offset.x = scaledX - this.viewBox[2] / 2
      this.offset.y = scaledY - this.viewBox[3] / 2
      this.updateOffset()
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
        const windowWidth = this.browserDimensions.width
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

        const MIN_WIDTH = this.browserDimensions.width * MIN_TAPESTRY_WIDTH_FACTOR
        const MIN_HEIGHT = this.browserDimensions.height * MIN_TAPESTRY_WIDTH_FACTOR

        this.unscaledViewBox = [
          tapestryDimensions.startX,
          tapestryDimensions.startY,
          Math.max(tapestryDimensions.width - tapestryDimensions.startX, MIN_WIDTH),
          Math.max(
            tapestryDimensions.height - tapestryDimensions.startY,
            MIN_HEIGHT
          ),
        ]
        this.viewBox = [
          this.unscaledViewBox[0] * this.scale,
          this.unscaledViewBox[1] * this.scale,
          this.unscaledViewBox[2],
          this.unscaledViewBox[3],
        ]
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
    handleNodeClick({ event, level }) {
      const baseRadius = Helpers.getNodeBaseRadius(level, this.maxLevel)
      const targetScale = 140 / baseRadius
      const deltaScale = targetScale - this.scale
      this.handleZoom(deltaScale, event.offsetX, event.offsetY)
      this.updateScale()
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
    handleKey(evt) {
      const { code } = evt
      const node = this.getNode(this.selectedId)
      if (code === "Enter") {
        if (
          node.accessible ||
          Helpers.hasPermission(node, "edit", this.settings.showRejected)
        ) {
          this.$root.$emit("open-node", node.id)
        }
      } else if (code === "Tab") {
        // ? potentially let the user tab out of the main tapestry view, since the user should be fully capable of navigating through all the nodes by using just arrow keys
      } else if (code === "KeyE") {
        if (Helpers.hasPermission(node, "edit", this.settings.showRejected)) {
          this.$root.$emit("edit-node", node.id)
        }
      } else if (code === "KeyQ" || code === "Escape") {
        // focus the next element after the main
        document.querySelector(".minimap-button button")?.focus()
      } else {
        if (node.id === this.getCurrentNodeNav) {
          if (code === "ArrowDown") {
            evt.preventDefault()
            this.goToNodeChildren().then(this.setSelectedNode)
          } else if (code === "ArrowUp") {
            evt.preventDefault()
            this.goToNodeParent().then(this.setSelectedNode)
          } else if (code === "ArrowRight") {
            evt.preventDefault()
            this.goToNodeSibling(1).then(this.setSelectedNode)
          } else if (code === "ArrowLeft") {
            evt.preventDefault()
            this.goToNodeSibling(-1).then(this.setSelectedNode)
          }
        } else {
          this.resetNodeNavigation(node.id)
        }
      }
    },
    setSelectedNode(nodeId) {
      if (nodeId === false) {
        return
      }
      this.$router.push({
        name: names.APP,
        params: { nodeId },
        query: this.$route.query,
        path: `/nodes/${nodeId}`,
      })
      this.focusSelectedNode()
    },
    focusSelectedNode() {
      this.$nextTick(() => {
        const nodeElement = document.querySelector(
          `.node[data-id='${this.selectedId}']`
        )
        nodeElement && nodeElement.focus()
      })
    },
  },
}
</script>

<style lang="scss" scoped>
#tapestry {
  cursor: move;

  &.panning {
    cursor: grabbing;
  }
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
    position: relative;

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
