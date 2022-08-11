<template>
  <main
    id="tapestry"
    ref="app"
    :class="{ 'can-pan': canPan, panning: isPanning }"
    :style="{
      height: appHeight,
    }"
    @mousedown="handleMousedownOnApp"
  >
    <div v-if="empty">
      <root-node-button v-if="canEdit" @click="addRootNode"></root-node-button>
      <div v-else class="empty-message">The requested Tapestry is empty.</div>
    </div>
    <div v-else ref="dragArea">
      <svg
        ref="vue-svg"
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
        <g v-if="dragSelectEnabled" class="nodes">
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
    </div>
    <tapestry-toolbar />
    <tapestry-node-toolbar v-for="(node, id) in nodes" :key="id" :node="node" />
    <tapestry-link-toolbar
      v-for="link in links"
      :key="`${link.source}-${link.target}`"
      :source="nodes[link.source]"
      :target="nodes[link.target]"
    />
    <tapestry-minimap
      v-if="showMinimap"
      ref="minimap"
      :view-box="unscaledViewBox"
      :scale="scale"
      :offset="offset"
      :isDragSelecting="isDragSelecting"
      @pan-by="handleMinimapPanBy"
      @pan-to="handleMinimapPanTo"
      @close="showMinimap = false"
    ></tapestry-minimap>
    <tapestry-minimap-button
      v-else
      @click="showMinimap = true"
    ></tapestry-minimap-button>
  </main>
</template>

<script>
import DragSelectModular from "@/utils/dragSelectModular"
import { mapActions, mapGetters, mapMutations, mapState } from "vuex"
import TapestryNode from "./TapestryNode"
import TapestryLink from "./TapestryLink"
import TapestryToolbar from "./TapestryToolbar"
import TapestryNodeToolbar from "./TapestryNodeToolbar"
import TapestryLinkToolbar from "./TapestryLinkToolbar"
import TapestryMinimapButton from "./TapestryMinimap/TapestryMinimapButton"
import TapestryMinimap from "./TapestryMinimap"
import RootNodeButton from "./RootNodeButton"
import LockedTooltip from "./LockedTooltip"
import Helpers from "@/utils/Helpers"
import ZoomPanHelper from "@/utils/ZoomPanHelper"
import { names } from "@/config/routes"
import * as wp from "@/services/wp"
import { tools } from "@/utils/constants"
// import { scaleConstants } from "@/utils/constants"

export default {
  components: {
    TapestryNode,
    TapestryLink,
    TapestryToolbar,
    TapestryNodeToolbar,
    TapestryLinkToolbar,
    TapestryMinimapButton,
    TapestryMinimap,
    RootNodeButton,
    LockedTooltip,
  },
  data() {
    return {
      isDragSelecting: false,
      activeNode: null,

      appHeight: "100vh",

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
      "rootId",
      "browserDimensions",
      "maxLevel",
      "currentDepth",
      "scaleConstants",
      "currentTool",
    ]),
    ...mapGetters(["getNode", "getCurrentNodeNav"]),
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
    canPan() {
      return this.currentTool === null || this.currentTool === tools.PAN
    },
    empty() {
      return Object.keys(this.nodes).length === 0
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
    browserHeight() {
      return this.browserDimensions.height
    },
  },
  watch: {
    empty(empty) {
      if (!empty) {
        this.zoomPanHelper.unregister()
        this.zoomPanHelper.register()
        this.registerKeyHandler()
      }
    },
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
        if (nodeId !== this.getCurrentNodeNav) {
          this.resetNodeNavigation(nodeId)
        }
        this.updateViewBox()
      },
    },
    browserDimensions: {
      deep: true,
      handler() {
        this.updateAppHeight()
      },
    },
    routeName(newName, oldName) {
      if (newName === names.APP && oldName === names.LIGHTBOX) {
        // TODO: this is not needed anymore due to new lightbox using Bootstrap modal which automatically returns focus to last selected node; remove after testing on a screen reader
        // this.focusSelectedNode()
      }
    },
    currentTool: {
      handler(newTool) {
        if (this.dragSelectEnabled && newTool === tools.SELECT) {
          DragSelectModular.initializeDragSelect(
            this.$refs.dragArea,
            this,
            this.nodes
          )
        } else {
          DragSelectModular.disableDragSelect()
        }
      },
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
      DragSelectModular.initialize(
        () => {
          this.isDragSelecting = true
        },
        () => {
          this.isDragSelecting = false
        }
      )
    }

    this.updateViewBox()

    this.zoomPanHelper = new ZoomPanHelper(
      "tapestry",
      (delta, x, y) => {
        this.handleZoom(delta * this.scaleConstants.zoomSensitivity, x, y)
        this.$root.$emit("context-toolbar::dismiss")
      },
      () => {
        this.updateScale()
        this.fetchAppDimensions()
      },
      (dx, dy, fromMinimap = false) => {
        this.handlePan(
          dx * this.scaleConstants.panSensitivity,
          dy * this.scaleConstants.panSensitivity,
          fromMinimap
        )
      },
      (fromMinimap = false) => {
        this.handlePanEnd(fromMinimap)
      },
      [this.$refs.minimap.$el]
    )
    this.zoomPanHelper.register()
    this.$refs.app.addEventListener("keydown", this.handleKey)

    this.$nextTick(() => {
      this.updateAppHeight()
    })

    this.$root.$on("bv::modal::show", () => {
      this.setCurrentTool(null)
    })
    this.$root.$on("bv::modal::hide", () => {
      this.setCurrentTool(null)
    })
  },
  beforeDestroy() {
    this.zoomPanHelper && this.zoomPanHelper.unregister()
    this.$refs.app.removeEventListener("keydown", this.handleKey)
  },
  methods: {
    ...mapMutations(["select", "unselect", "clearSelection", "setCurrentTool"]),
    ...mapActions([
      "goToNodeChildren",
      "goToNodeParent",
      "goToNodeSibling",
      "resetNodeNavigation",
    ]),
    addRootNode() {
      this.$root.$emit("add-node", null)
    },
    clampScale(scale) {
      return Math.max(
        Math.min(scale, this.maxScale),
        this.scaleConstants.minTapestrySizeToScreen
      )
    },
    updateAppHeight() {
      if (this.$refs.app) {
        const bodyHeight = document.body.getBoundingClientRect().height
        const appHeight = this.$refs.app.getBoundingClientRect().height
        // TODO: removing the min. 50vh restriction below will result in the Tapestry getting extremely small when header and footer take up too much space
        this.appHeight = `max(50vh, ${this.browserDimensions.height -
          bodyHeight +
          appHeight}px)`
      } else {
        this.appHeight = "100vh"
      }
      this.$nextTick(() => {
        this.updateViewBox()
      })
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
    handlePan(dx, dy, fromMinimap) {
      if (!this.canPan && !fromMinimap) {
        return
      }
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
    handlePanEnd(fromMinimap) {
      if (!this.canPan && !fromMinimap) {
        return
      }
      this.isPanning = false
      this.updateOffset()
      this.fetchAppDimensions()
    },
    handleMinimapPanBy({ dx, dy }) {
      // dx, dy passed here is in viewBox dimensions, not screen pixels; we apply the changes to the offset directly, bypassing the calculations in handlePan
      this.offset.x -= dx * this.scaleConstants.panSensitivity
      this.offset.y -= dy * this.scaleConstants.panSensitivity
      // TODO: this.zoomPanHelper.onPan(dx, dy, true)
      //       this.zoomPanHelper.onPanEnd(true)
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
          startX: x0 - MAX_RADIUS * 1.25,
          startY: y0 - MAX_RADIUS * 1.25,
          width: x + MAX_RADIUS * 1.25,
          height: y + MAX_RADIUS * 1.25,
        }
        const tapestryWidth = tapestryDimensions.width - tapestryDimensions.startX
        const tapestryHeight = tapestryDimensions.height - tapestryDimensions.startY

        const appAspectRatio = width / height
        const tapestryAspectRatio = tapestryWidth / tapestryHeight
        if (appAspectRatio > tapestryAspectRatio) {
          const targetWidth = tapestryHeight * appAspectRatio
          const widthDiff = targetWidth - tapestryWidth
          tapestryDimensions.width += widthDiff / 2
          tapestryDimensions.startX -= widthDiff / 2
        } else {
          const targetHeight = tapestryWidth / appAspectRatio
          const heightDiff = targetHeight - tapestryHeight
          tapestryDimensions.height += heightDiff / 2
          tapestryDimensions.startY -= heightDiff / 2
        }

        // const windowWidth = this.browserDimensions.width
        // Center the nodes if there is not enough of them to fill the width of the screen
        // if (
        //   tapestryDimensions.width - tapestryDimensions.startX - MAX_RADIUS * 1.25 <
        //   windowWidth
        // ) {
        //   tapestryDimensions.startX -=
        //     (windowWidth - tapestryDimensions.width + tapestryDimensions.startX) /
        //       2 +
        //     MAX_RADIUS
        // }

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
      // Ignore key events if focus is outside Tapestry view
      if (!this.$refs["vue-svg"].contains(document.activeElement)) {
        return
      }

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
    handleMousedownOnApp() {
      this.$root.$emit("context-toolbar::dismiss")
    },
  },
}
</script>

<style lang="scss" scoped>
#tapestry {
  position: relative;

  &.can-pan {
    cursor: move;
  }

  &.panning {
    cursor: grabbing;
  }

  .empty-message {
    margin: 30vh auto;
  }

  svg {
    position: relative;
  }
}
</style>

<style lang="scss">
// Override dragselect's default styles so that the minimap covers the select rectangle
.ds-selector-area {
  z-index: -1 !important;
}
</style>
