<template>
  <main
    id="tapestry"
    ref="app"
    :class="{
      panning: isPanning,
      empty: isEmptyTapestry,
      'node-placeholder-visible': showNodePlaceholder,
    }"
    :data-tool="currentTool"
    :style="{
      height: appHeight,
    }"
    @keydown="handleKey"
  >
    <div v-if="isEmptyTapestry" class="vertical-center">
      <root-node-button v-if="isLoggedIn"></root-node-button>
      <div v-else class="empty-message">The requested Tapestry is empty.</div>
    </div>
    <div v-else ref="dragArea">
      <svg
        id="vue-svg"
        ref="vue-svg"
        role="application"
        aria-label="Main Tapestry View"
        :viewBox="computedViewBox"
        @click="handleClickOnSvg"
        @mousemove="handleMousemoveOnSvg"
      >
        <tapestry-link-placeholder
          v-if="linkToolNode"
          ref="linkPlaceholder"
          :node="linkToolNode"
          :scale="scale"
          :coordinates="mouseCoordinates"
        />
        <g v-for="r in renderedLevels" :key="r.level">
          <g class="node-shadows">
            <tapestry-node-shadow
              v-for="(node, id) in r.nodes"
              :key="id"
              :node="node"
              :scale="scale"
              :root="id == selectedId"
              tabindex="-1"
            ></tapestry-node-shadow>
          </g>
          <g class="links">
            <tapestry-link
              v-for="link in r.links"
              :key="`${link.source}-${link.target}`"
              :source="nodes[link.source]"
              :target="nodes[link.target]"
              :scale="scale"
              tabindex="-1"
              @click="handleLinkClick(link)"
              @focus="handleLinkClick(link)"
            ></tapestry-link>
          </g>
          <g class="nodes">
            <tapestry-node
              v-for="(node, id) in r.nodes"
              :key="id"
              :node="node"
              :scale="scale"
              class="node"
              :class="{ selectable: true }"
              :data-id="id"
              :root="id == selectedId"
              :is-editing-title="nodeEditingTitle == id"
              tabindex="-1"
              @dragstart="handleNodeDragStart"
              @drag="handleNodeDrag"
              @dragend="handleNodeDragEnd"
              @mouseover="handleMouseover(id)"
              @mouseleave="activeNode = null"
              @mounted="dragSelectEnabled ? updateSelectableNodes(node) : null"
              @click="handleNodeClick"
              @focus="handleNodeFocus(id)"
              @node-editing-title="nodeEditingTitle = $event"
            ></tapestry-node>
          </g>
        </g>
        <tapestry-node-placeholder
          :scale="scale"
          :show="showNodePlaceholder"
          :coordinates="mouseCoordinates"
          :level="selectedNodeLevel"
          @click="handleNodePlaceholderClick"
        />
        <locked-tooltip
          v-if="activeNode"
          :node="nodes[activeNode]"
          :viewBox="computedViewBox"
        ></locked-tooltip>
      </svg>
      <tapestry-node-toolbar
        :show="showContextToolbar == 'node'"
        :node="selectedNode"
        :position="nodeToolbarPosition"
        @set-show="setShowContextToolbar('node', $event)"
      ></tapestry-node-toolbar>
      <tapestry-multi-node-toolbar
        :show="showContextToolbar == 'multi-node'"
        :position="multiNodeToolbarPosition"
        @set-show="setShowContextToolbar('multi-node', $event)"
      ></tapestry-multi-node-toolbar>
      <tapestry-link-toolbar
        :show="showContextToolbar == 'link'"
        :link="activeLink"
        :position="linkToolbarPosition"
        @set-show="setShowContextToolbar('link', $event)"
      />
      <tapestry-toolbar />
      <tapestry-minimap
        v-if="showMinimap"
        ref="minimap"
        :view-box="unscaledViewBox"
        :scale="scale"
        :offset="offset"
        :is-drag-selecting="isDragSelecting"
        @pan-by="handleMinimapPanBy"
        @pan-to="handleMinimapPanTo"
        @close="showMinimap = false"
      ></tapestry-minimap>
      <tapestry-minimap-button
        v-else
        @click="showMinimap = true"
      ></tapestry-minimap-button>
    </div>
  </main>
</template>

<script>
import DragSelectModular from "@/utils/dragSelectModular"
import { mapActions, mapGetters, mapMutations, mapState } from "vuex"
import TapestryNode from "./TapestryNode"
import TapestryLink from "./TapestryLink"
import TapestryToolbar from "./TapestryToolbar"
import TapestryNodeToolbar from "./TapestryNodeToolbar"
import TapestryMultiNodeToolbar from "./TapestryMultiNodeToolbar"
import TapestryLinkToolbar from "./TapestryLinkToolbar"
import TapestryNodeShadow from "./TapestryNodeShadow"
import TapestryNodePlaceholder from "./TapestryNodePlaceholder"
import TapestryLinkPlaceholder from "./TapestryLinkPlaceholder"
import TapestryMinimapButton from "./TapestryMinimap/TapestryMinimapButton"
import TapestryMinimap from "./TapestryMinimap"
import RootNodeButton from "./RootNodeButton"
import LockedTooltip from "./LockedTooltip"
import Helpers from "@/utils/Helpers"
import ZoomPanHelper from "@/utils/ZoomPanHelper"
import { names } from "@/config/routes"
import * as wp from "@/services/wp"
import { interpolate } from "@/utils/interpolate"
import { tools } from "@/utils/constants"
// import { scaleConstants } from "@/utils/constants"

export default {
  components: {
    TapestryNode,
    TapestryLink,
    TapestryToolbar,
    TapestryNodeToolbar,
    TapestryMultiNodeToolbar,
    TapestryLinkToolbar,
    TapestryNodeShadow,
    TapestryNodePlaceholder,
    TapestryLinkPlaceholder,
    TapestryMinimapButton,
    TapestryMinimap,
    RootNodeButton,
    LockedTooltip,
  },
  data() {
    return {
      isDragSelecting: false,
      didDragSelect: false,
      activeNode: null,

      appHeight: "100vh",

      unscaledViewBox: [2200, 2700, 1600, 1100],
      viewBox: [2200, 2700, 1600, 1100],
      scale: 1,
      manualScale: 1,
      offset: { x: 0, y: 0 },
      appDimensions: null,
      zoomPanHelper: null,
      isPanning: false,
      isTransitioning: false,

      dragCoordinates: {},
      dragTimer: null,
      dragEdgeDirection: { x: 0, y: 0 },
      dragOffsetDelta: { x: 0, y: 0 },

      screenMouseCoordinates: { x: 0, y: 0 },
      linkToolNode: null,
      nodeEditingTitle: null,

      showMinimap: true,
      showContextToolbar: false, // one of false, "node", "multi-node", "link"
      activeLink: null, // for link context toolbar
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
      "currentTool",
    ]),
    ...mapGetters([
      "isEmptyTapestry",
      "getNode",
      "getInitialNodeId",
      "getNodeNavId",
      "getNodeNavParent",
    ]),
    nodeNavLinkMode: {
      get() {
        return this.$store.state.nodeNavigation.linkMode
      },
      set(linkMode) {
        this.$store.commit("setNodeNavigation", { linkMode })
      },
    },
    focused() {
      if (this.getNodeNavId === -1) {
        return null
      }
      if (this.nodeNavLinkMode) {
        return {
          type: "link",
          source: this.getNodeNavParent,
          target: this.getNodeNavId,
        }
      } else {
        return {
          type: "node",
          id: this.getNodeNavId,
        }
      }
    },
    renderedLevels() {
      const levels = []
      for (let i = 1; i <= this.maxLevel; i++) {
        levels.push({
          level: i,
          nodes: {},
          links: [],
        })
      }
      for (const link of this.links) {
        levels[
          Math.max(this.nodes[link.source].level, this.nodes[link.target].level) - 1
        ].links.push(link)
      }
      for (const id in this.nodes) {
        const node = this.nodes[id]
        levels[node.level - 1].nodes[id] = node
      }
      levels.reverse()
      return levels
    },
    computedViewBox() {
      // return this.viewBox.join(" ")
      return `${this.viewBox[0] + this.offset.x} ${this.viewBox[1] +
        this.offset.y} ${this.viewBox[2]} ${this.viewBox[3]}`
    },
    background() {
      return this.settings.backgroundUrl
    },
    isSidebarOpen() {
      return !!this.$route.query.sidebar
    },
    isLoggedIn() {
      return wp.isLoggedIn()
    },
    canEdit() {
      return wp.canEditTapestry()
    },
    canPan() {
      return !this.isEmptyTapestry && this.currentTool !== tools.SELECT
    },
    showNodePlaceholder() {
      return this.currentTool === tools.ADD_NODE && this.nodeEditingTitle === null
    },
    selectedId() {
      return Number(this.$route.params.nodeId)
    },
    selectedNode() {
      return this.getNode(this.selectedId)
    },
    selectedNodeLevel() {
      return this.getNode(this.selectedId)?.level ?? 1
    },
    dragSelectEnabled() {
      return !this.settings.renderMap
    },
    maxScale() {
      // TODO: may need to update how the smallest node size is calculated
      return Math.max(
        (this.scaleConstants.maxNodeSizeToScreen *
          Math.min(this.viewBox[2], this.viewBox[3])) /
          Helpers.getNodeBaseRadius(this.maxLevel),
        140 / Helpers.getNodeBaseRadius(this.maxLevel)
      )
    },
    routeName() {
      return this.$route.name
    },
    browserHeight() {
      return this.browserDimensions.height
    },
    mouseCoordinates() {
      if (!this.appDimensions) {
        return { x: 0, y: 0 }
      }
      const { width, height } = this.appDimensions
      const relativeX = (this.screenMouseCoordinates.x / width) * this.viewBox[2]
      const relativeY = (this.screenMouseCoordinates.y / height) * this.viewBox[3]
      const absoluteX = relativeX + this.viewBox[0] + this.offset.x
      const absoluteY = relativeY + this.viewBox[1] + this.offset.y
      return {
        x: absoluteX,
        y: absoluteY,
      }
    },
    nodeToolbarPosition() {
      if (!this.selectedNode || !this.appDimensions) {
        return null
      }

      const { x, y } = this.svgToScreen(this.selectedNode.coordinates)
      const r =
        (Helpers.getNodeRadius(this.selectedNode.level, this.scale) /
          this.viewBox[2]) *
        this.appDimensions.width *
        1.2 // times 1.2 to account for rings around the node

      return {
        left: x - r,
        top: y - r,
        right: x + r,
        bottom: y + r,
        width: r * 2,
        height: r * 2,
      }
    },
    multiNodeToolbarPosition() {
      if (this.selection.length === 0 || !this.appDimensions) {
        return null
      }

      let x = 0,
        y = 0
      for (const id of this.selection) {
        const coords = this.svgToScreen(this.getNode(id).coordinates)
        x += coords.x
        y += coords.y
      }
      x /= this.selection.length
      y /= this.selection.length

      return {
        left: x,
        top: y,
        right: x,
        bottom: y,
        width: 0,
        height: 0,
      }
    },
    linkToolbarPosition() {
      if (!this.activeLink || !this.appDimensions) {
        return null
      }

      const source = this.getNode(this.activeLink.source)
      const target = this.getNode(this.activeLink.target)
      const center = {
        x: (source.coordinates.x + target.coordinates.x) / 2,
        y: (source.coordinates.y + target.coordinates.y) / 2,
      }
      const { x, y } = this.svgToScreen(center)
      // may want to adjust the behaviour so that the link toolbar position is the cursor position when clicking on the link instead of the middle of the link (for better experience when the link is very long)

      return {
        left: x,
        top: y,
        right: x,
        bottom: y,
        width: 0,
        height: 0,
      }
    },
  },
  watch: {
    isEmptyTapestry(empty) {
      if (empty) {
        this.zoomPanHelper.unregister()
        this.setCurrentTool(null)
      } else {
        this.zoomPanHelper.register()
        this.setCurrentTool(tools.PAN)
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
    isSidebarOpen() {
      setTimeout(() => {
        this.updateViewBox()
        this.fetchAppDimensions()
      }, 300)
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
        if (nodeId !== this.getNodeNavId) {
          this.resetNodeNavigation(nodeId)
        }
        this.updateViewBox()
      },
    },
    selection(selection) {
      if (!this.isDragSelecting) {
        this.setShowContextToolbar("multi-node", selection.length !== 0)
      }
    },
    showContextToolbar(newVal, oldVal) {
      if (oldVal === "link") {
        this.activeLink = null
      }
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
    focused: {
      deep: true,
      handler(newFocused, oldFocused) {
        if (oldFocused) {
          this.getFocusableElement(oldFocused)?.setAttribute("tabindex", "-1")
        }
        const el = this.getFocusableElement(newFocused)
        el?.setAttribute("tabindex", "0")
        el?.focus()
      },
    },
    currentTool(newTool, oldTool) {
      if (this.dragSelectEnabled && newTool === tools.SELECT) {
        DragSelectModular.initializeDragSelect(this.$refs.dragArea, this, this.nodes)
      } else {
        DragSelectModular.disableDragSelect()
      }

      if (oldTool === tools.ADD_LINK) {
        this.linkToolNode = null
      }
    },
  },
  mounted() {
    if (this.dragSelectEnabled) {
      DragSelectModular.initialize(
        () => {
          this.isDragSelecting = true
          this.didDragSelect = false
          this.setShowContextToolbar("multi-node", false)
        },
        () => {
          this.isDragSelecting = false
          this.didDragSelect = true
        }
      )
    }

    this.updateViewBox()

    this.zoomPanHelper = new ZoomPanHelper(
      "tapestry",
      (delta, x, y, target) => {
        this.handleZoom(delta * this.scaleConstants.zoomSensitivity, x, y, target)
      },
      () => {},
      (dx, dy) => {
        this.handlePan(
          dx * this.scaleConstants.panSensitivity,
          dy * this.scaleConstants.panSensitivity
        )
      },
      () => {
        this.isPanning = false
      },
      () => (this.$refs.minimap ? [this.$refs.minimap.$el] : []),
      ["vue-svg"]
    )
    if (!this.isEmptyTapestry) {
      this.zoomPanHelper.register()
    }

    if (this.selectedId) {
      this.zoomToAndCenterNode(this.getNode(this.selectedId))
    }

    this.$nextTick(() => {
      this.updateAppHeight()
    })

    if (!this.isEmptyTapestry) {
      this.setCurrentTool(tools.PAN)
    }
  },
  beforeDestroy() {
    this.zoomPanHelper && this.zoomPanHelper.unregister()
  },
  methods: {
    ...mapActions(["updateNodeCoordinates"]),
    ...mapMutations(["select", "unselect", "clearSelection", "setCurrentTool"]),
    ...mapActions([
      "goToNodeChildren",
      "goToNodeParent",
      "goToNodeSibling",
      "resetNodeNavigation",
      "addLink",
      "addNode",
    ]),
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
        this.fetchAppDimensions()
        this.updateViewBox()
      })
    },
    clampScale(scale) {
      return Math.max(
        Math.min(scale, this.maxScale),
        this.scaleConstants.minTapestrySizeToScreen
      )
    },
    clampOffset() {
      const { x, y } = this.clampOffsetValue(this.offset)
      this.offset.x = x
      this.offset.y = y
    },
    clampOffsetValue(offset, scale) {
      if (this.scaleConstants.disableOffsetClamp) {
        return offset
      }
      if (!scale) {
        scale = this.scale
      }
      const maxNodeSize = Helpers.getNodeRadius(1, scale)
      if (scale < 1) {
        const centerX = (-1 * this.viewBox[2] * (1 - scale)) / 2
        const centerY = (-1 * this.viewBox[3] * (1 - scale)) / 2
        return {
          x: Math.max(
            Math.min(offset.x, centerX + maxNodeSize),
            centerX - maxNodeSize
          ),
          y: Math.max(
            Math.min(offset.y, centerY + maxNodeSize),
            centerY - maxNodeSize
          ),
        }
      } else {
        const minOffsetX = Math.min(0, -1 * maxNodeSize)
        const maxOffsetX = this.viewBox[2] * (scale - 1) + maxNodeSize
        const minOffsetY = Math.min(0, -1 * maxNodeSize)
        const maxOffsetY = this.viewBox[3] * (scale - 1) + maxNodeSize
        return {
          x: Math.max(Math.min(offset.x, maxOffsetX), minOffsetX),
          y: Math.max(Math.min(offset.y, maxOffsetY), minOffsetY),
        }
      }
    },
    fetchAppDimensions() {
      if (!this.$refs.app) {
        return
      }
      const { width, height, x, y } = this.$refs.app.getBoundingClientRect()
      this.appDimensions = {
        width,
        height,
        x,
        y,
      }
    },
    handleZoom(delta, clientX, clientY, target) {
      if (this.isEmptyTapestry || !this.appDimensions) {
        return
      }
      const newScale = this.clampScale(this.scale + delta)
      const scaleChange = newScale / this.scale

      this.manualScale = Math.max(
        1,
        Math.min(this.maxScale / 2, this.manualScale + newScale - this.scale)
      )

      const isMinimapZoom =
        target && target.id === "tapestry-minimap" && this.$refs.minimap
      const dimensions = isMinimapZoom
        ? this.$refs.minimap.getMinimapDimensions()
        : this.appDimensions

      const x = clientX - dimensions.x
      const y = clientY - dimensions.y

      const relativeX = (x / dimensions.width) * this.viewBox[2]
      const relativeY = (y / dimensions.height) * this.viewBox[3]
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
      this.clampOffset()

      this.scale = newScale
    },
    handlePan(dx, dy) {
      if (!this.canPan || !this.appDimensions) {
        return
      }
      if (!this.isPanning) {
        this.isPanning = true
      }
      const { width, height } = this.appDimensions
      dx = (dx / width) * this.viewBox[2]
      dy = (dy / height) * this.viewBox[3]
      this.offset.x -= dx
      this.offset.y -= dy
      this.clampOffset()
    },
    handleMinimapPanBy({ dx, dy }) {
      // dx, dy passed here is in viewBox dimensions, not screen pixels; we apply the changes to the offset directly, bypassing the calculations in handlePan
      this.offset.x -= dx * this.scaleConstants.panSensitivity * this.scale
      this.offset.y -= dy * this.scaleConstants.panSensitivity * this.scale
      this.clampOffset()
      this.zoomPanHelper.onPanEnd()
    },
    handleMinimapPanTo({ x, y }) {
      // x, y is in viewbox coordinates (before scaling)
      // put (x, y) to the center of the view
      const scaledX = x * this.scale
      const scaledY = y * this.scale
      this.offset.x = scaledX - this.viewBox[2] / 2
      this.offset.y = scaledY - this.viewBox[3] / 2
      this.clampOffset()
    },
    zoomToAndCenterNode(node) {
      const baseRadius = Helpers.getNodeBaseRadius(node.level, this.maxLevel)
      const targetScale = 140 / baseRadius

      const targetRadius = Helpers.getNodeRadius(
        node.level,
        this.maxLevel,
        targetScale
      )
      const targetViewBoxX = this.unscaledViewBox[0] * targetScale
      const targetViewBoxY = this.unscaledViewBox[1] * targetScale
      let targetOffset = {
        x:
          node.coordinates.x * targetScale -
          targetViewBoxX -
          (this.viewBox[2] - targetRadius) / 2,
        y:
          node.coordinates.y * targetScale -
          targetViewBoxY -
          (this.viewBox[3] - targetRadius) / 2,
      }
      targetOffset = this.clampOffsetValue(targetOffset, targetScale)

      this.isTransitioning = true
      interpolate(
        {
          scale: this.scale,
          offsetX: this.offset.x,
          offsetY: this.offset.y,
          viewBoxX: this.viewBox[0],
          viewBoxY: this.viewBox[1],
        },
        {
          scale: targetScale,
          offsetX: targetOffset.x,
          offsetY: targetOffset.y,
          viewBoxX: targetViewBoxX,
          viewBoxY: targetViewBoxY,
        },
        300,
        ({ scale, offsetX, offsetY, viewBoxX, viewBoxY }) => {
          this.scale = scale
          this.offset.x = offsetX
          this.offset.y = offsetY
          this.viewBox[0] = viewBoxX
          this.viewBox[1] = viewBoxY
        },
        () => {
          this.isTransitioning = false
          if (!this.nodeNavLinkMode) {
            this.showContextToolbar = "node"
          }
        }
      )
    },
    updateSelectableNodes() {
      DragSelectModular.updateSelectableNodes()
    },
    hasPermission(node, action) {
      return Helpers.hasPermission(node, action, this.settings.showRejected)
    },
    updateViewBox() {
      const MAX_RADIUS = 240
      const MIN_TAPESTRY_WIDTH_FACTOR = 1.5
      if (this.$refs.app) {
        // check if <main> in TapestryMain has rendered
        const { width, height } = this.$refs.app.getBoundingClientRect()
        const { x0, y0, x, y } = this.getNodeDimensions()

        const boundaries = {
          startX: x0 - MAX_RADIUS * 1.25,
          startY: y0 - MAX_RADIUS * 1.25,
          endX: x + MAX_RADIUS * 1.25,
          endY: y + MAX_RADIUS * 1.25,
        }
        const tapestry = {
          x: boundaries.startX,
          y: boundaries.startY,
          width: boundaries.endX - boundaries.startX,
          height: boundaries.endY - boundaries.startY,
        }

        // add spaces to the sides if the tapestry is too narrow or too tall
        const appAspectRatio = width / height
        const tapestryAspectRatio = tapestry.width / tapestry.height
        if (appAspectRatio > tapestryAspectRatio) {
          const targetWidth = tapestry.height * appAspectRatio
          const widthDiff = targetWidth - tapestry.width
          tapestry.width += widthDiff
          tapestry.x -= widthDiff / 2
        } else {
          const targetHeight = tapestry.width / appAspectRatio
          const heightDiff = targetHeight - tapestry.height
          tapestry.height += heightDiff
          tapestry.y -= heightDiff / 2
        }

        // expand the view to the min. width and height if needed, and center the tapestry
        const MIN_WIDTH = width * MIN_TAPESTRY_WIDTH_FACTOR
        const MIN_HEIGHT = height * MIN_TAPESTRY_WIDTH_FACTOR
        if (tapestry.width < MIN_WIDTH) {
          const widthDiff = MIN_WIDTH - tapestry.width
          tapestry.width += widthDiff
          tapestry.x -= widthDiff / 2
        }
        if (tapestry.height < MIN_HEIGHT) {
          const heightDiff = MIN_HEIGHT - tapestry.height
          tapestry.height += heightDiff
          tapestry.y -= heightDiff / 2
        }

        this.unscaledViewBox = [
          tapestry.x,
          tapestry.y,
          tapestry.width,
          tapestry.height,
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
    handleNodeFocus(nodeId) {
      if (nodeId == this.selectedId) {
        this.showContextToolbar = "node"
      }
    },
    handleNodeClick({ node, shouldOpenToolbar }) {
      if (this.currentTool === tools.ADD_LINK) {
        if (this.linkToolNode === null) {
          this.linkToolNode = node
        } else if (node.id === this.linkToolNode.id) {
          this.linkToolNode = null
        } else {
          const linkExists = this.links.some(
            link =>
              (link.source === this.linkToolNode.id && link.target === node.id) ||
              (link.source === node.id && link.target === this.linkToolNode.id)
          )
          if (!linkExists) {
            this.$refs.linkPlaceholder.freeze()
            this.addLink({ source: this.linkToolNode.id, target: node.id }).then(
              () => {
                this.$refs.linkPlaceholder.unfreeze()
                this.linkToolNode = null
              }
            )
          }
        }
        return
      }

      // zoom to the level that the node is on, and pan towards the node
      const targetScale = Helpers.getTargetScale(node.level) * this.manualScale
      const deltaScale = targetScale - this.scale

      const targetViewBoxX = this.unscaledViewBox[0] * targetScale
      const targetViewBoxY = this.unscaledViewBox[1] * targetScale

      let targetOffset = {
        x:
          this.offset.x +
          (node.coordinates.x - this.unscaledViewBox[0]) * deltaScale,
        y:
          this.offset.y +
          (node.coordinates.y - this.unscaledViewBox[1]) * deltaScale,
      }
      targetOffset = this.clampOffsetValue(targetOffset, targetScale)

      this.isTransitioning = true
      interpolate(
        {
          scale: this.scale,
          offsetX: this.offset.x,
          offsetY: this.offset.y,
          viewBoxX: this.viewBox[0],
          viewBoxY: this.viewBox[1],
        },
        {
          scale: targetScale,
          offsetX: targetOffset.x,
          offsetY: targetOffset.y,
          viewBoxX: targetViewBoxX,
          viewBoxY: targetViewBoxY,
        },
        Math.abs(deltaScale * 600),
        ({ scale, offsetX, offsetY, viewBoxX, viewBoxY }) => {
          this.scale = scale
          this.offset.x = offsetX
          this.offset.y = offsetY
          this.viewBox[0] = viewBoxX
          this.viewBox[1] = viewBoxY
        },
        () => {
          this.isTransitioning = false
          if (shouldOpenToolbar) {
            this.showContextToolbar = "node"
          }
        },
        "easeOut"
      )
    },
    handleNodeDragStart(node) {
      if (this.isTransitioning) {
        return
      }
      this.dragOffsetDelta = { x: 0, y: 0 }

      // save initial coordinates of nodes
      this.dragCoordinates = {}
      if (this.selection.length) {
        this.dragCoordinates = this.selection.reduce((coordinates, nodeId) => {
          const node = this.getNode(nodeId)
          coordinates[nodeId] = {
            x: node.coordinates.x,
            y: node.coordinates.y,
          }
          return coordinates
        }, {})
      } else {
        this.dragCoordinates[node.id] = {
          x: node.coordinates.x,
          y: node.coordinates.y,
        }
      }

      // initialize timer for automatic panning
      const triggerInterval = 50 // interval of automatic panning trigger, in milliseconds
      const speed = 20 // speed of automatic panning, in view pixels per triggerInterval
      clearInterval(this.dragTimer)
      this.dragTimer = setInterval(() => {
        const deltaX = speed * this.dragEdgeDirection.x
        const deltaY = speed * this.dragEdgeDirection.y

        if (deltaX !== 0 || deltaY !== 0) {
          this.offset.x += deltaX
          this.offset.y += deltaY
          this.dragOffsetDelta.x += deltaX
          this.dragOffsetDelta.y += deltaY
          for (const id of Object.keys(this.dragCoordinates)) {
            const node = this.getNode(id)
            node.coordinates.x += deltaX / this.scale
            node.coordinates.y += deltaY / this.scale
          }
        }
      }, triggerInterval)
    },
    handleNodeDrag({ x, y, dx, dy }) {
      // take into account the offset changes from automatic panning, and reset the recorded changes immediately to avoid counting them more than once
      const { x: offsetX, y: offsetY } = this.dragOffsetDelta
      this.dragOffsetDelta.x = 0
      this.dragOffsetDelta.y = 0
      for (const id of Object.keys(this.dragCoordinates)) {
        const node = this.getNode(id)
        node.coordinates.x += (dx - offsetX) / this.scale
        node.coordinates.y += (dy - offsetY) / this.scale
      }

      // detect dragging to edge of view
      const marginRatio = 0.1
      if (
        Math.abs(x - this.viewBox[0] - this.offset.x) <=
        this.viewBox[2] * marginRatio
      ) {
        this.dragEdgeDirection.x = -1
      } else if (
        Math.abs(this.viewBox[0] + this.offset.x + this.viewBox[2] - x) <=
        this.viewBox[2] * marginRatio
      ) {
        this.dragEdgeDirection.x = 1
      } else {
        this.dragEdgeDirection.x = 0
      }
      if (
        Math.abs(y - this.viewBox[1] - this.offset.y) <=
        this.viewBox[3] * marginRatio
      ) {
        this.dragEdgeDirection.y = -1
      } else if (
        Math.abs(this.viewBox[1] + this.offset.y + this.viewBox[3] - y) <=
        this.viewBox[3] * marginRatio
      ) {
        this.dragEdgeDirection.y = 1
      } else {
        this.dragEdgeDirection.y = 0
      }
    },
    handleNodeDragEnd({ dx, dy }) {
      if (this.isTransitioning) {
        return
      }
      clearInterval(this.dragTimer)
      this.dragTimer = null

      const { x: offsetX, y: offsetY } = this.dragOffsetDelta
      for (const [id, originalCoordinates] of Object.entries(this.dragCoordinates)) {
        const node = this.getNode(id)
        node.coordinates.x += (dx - offsetX) / this.scale
        node.coordinates.y += (dy - offsetY) / this.scale
        const coordinates = {
          x: node.coordinates.x,
          y: node.coordinates.y,
        }
        if (
          originalCoordinates.x == coordinates.x &&
          originalCoordinates.y == coordinates.y
        ) {
          continue
        }
        if (this.hasPermission(node, "edit") || this.hasPermission(node, "move")) {
          this.updateNodeCoordinates({
            id,
            coordinates,
            originalCoordinates,
          })
        }
      }

      this.updateViewBox()
      this.clampOffset()
    },
    handleLinkClick(link) {
      this.activeLink = link
      this.showContextToolbar = "link"
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
      if (this.isEmptyTapestry) {
        return
      }

      // Ignore key events if focused on a node title for in-place editing
      if (document.activeElement.className === "node-title") {
        return
      }

      // Ignore key events if focus is outside Tapestry view
      if (!this.$refs["vue-svg"]?.contains(document.activeElement)) {
        return
      }

      const { code } = evt
      const node = this.getNode(this.selectedId)
      if (code === "Enter") {
        if (!this.nodeNavLinkMode) {
          if (node.accessible || this.hasPermission(node, "edit")) {
            this.$root.$emit("open-node", node.id)
          }
        }
      } else if (code === "KeyS") {
        // focus the sidebar
        if (!this.$route.query.sidebar) {
          this.$router.push({
            ...this.$route,
            query: { ...this.$route.query, sidebar: "info" },
          })
        }
        this.$nextTick(() => {
          document.querySelector(".sidebar")?.focus()
        })
      } else if (code === "KeyE") {
        if (!this.nodeNavLinkMode) {
          if (this.hasPermission(node, "edit")) {
            this.$root.$emit("edit-node", node.id)
          }
        }
      } else if (code === "KeyQ" || code === "Escape") {
        // focus the next element after the main
        document.querySelector(".minimap-button button")?.focus()
      } else {
        if (node.id === this.getNodeNavId) {
          if (this.nodeNavLinkMode) {
            if (code === "ArrowDown") {
              evt.preventDefault()
              this.nodeNavLinkMode = false
              return
            } else if (code === "ArrowUp") {
              this.nodeNavLinkMode = false
            }
          } else if (evt.shiftKey && this.isLoggedIn) {
            if (code === "ArrowDown") {
              this.nodeNavLinkMode = true
            } else if (code === "ArrowUp" && this.getNodeNavParent !== -1) {
              evt.preventDefault()
              this.nodeNavLinkMode = true
              return
            }
          }
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
      this.zoomToAndCenterNode(this.getNode(nodeId))
    },
    getFocusableElement(focused) {
      return document.querySelector(
        focused.type === "node"
          ? `.node[data-id='${focused.id}']`
          : `#link-${focused.source}-${focused.target}`
      )
    },
    handleClickOnSvg() {
      if (!this.isPanning) {
        if (this.didDragSelect) {
          this.setShowContextToolbar("multi-node", this.selection.length !== 0)
          this.didDragSelect = false
        } else {
          this.showContextToolbar = false
        }
      }
    },
    handleMousemoveOnSvg(evt) {
      this.screenMouseCoordinates = {
        x: evt.offsetX,
        y: evt.offsetY,
      }
    },
    handleNodePlaceholderClick() {
      if (!this.isPanning && this.nodeEditingTitle === null) {
        const newNode = Helpers.createDefaultNode()
        newNode.coordinates = {
          x: this.mouseCoordinates.x / this.scale,
          y: this.mouseCoordinates.y / this.scale,
        }
        newNode.level = this.selectedNodeLevel
        newNode.title = "Untitled"
        this.addNode({ node: newNode }).then(id => {
          this.nodeEditingTitle = id
        })
      }
    },
    setShowContextToolbar(type, show) {
      if (show) {
        this.showContextToolbar = type
      } else if (this.showContextToolbar === type) {
        this.showContextToolbar = false
      }
    },
    svgToScreen({ x, y }) {
      return {
        x:
          ((x * this.scale - this.viewBox[0] - this.offset.x) / this.viewBox[2]) *
            this.appDimensions.width +
          this.appDimensions.x,
        y:
          ((y * this.scale - this.viewBox[1] - this.offset.y) / this.viewBox[3]) *
            this.appDimensions.height +
          this.appDimensions.y,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
#tapestry {
  position: relative;

  &[data-tool="pan"] {
    cursor: move;
  }

  &.node-placeholder-visible {
    cursor: copy;
  }

  &.panning {
    cursor: grabbing;
  }

  .vertical-center {
    position: relative;
    padding-top: 50px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
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
