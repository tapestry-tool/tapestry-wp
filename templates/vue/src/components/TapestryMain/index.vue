<template>
  <main id="tapestry" ref="app" :style="background" :class="{ panning: isPanning }">
    <div v-if="empty">
      <root-node-button v-if="canEdit" @click="addRootNode"></root-node-button>
      <div v-else class="empty-message">The requested Tapestry is empty.</div>
    </div>
    <svg
      v-else
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
          tabindex="-1"
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
          tabindex="-1"
          @dragstart="handleNodeDragStart"
          @drag="handleNodeDrag"
          @dragend="handleNodeDragEnd"
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
import TapestryMinimapButton from "./TapestryMinimap/TapestryMinimapButton"
import TapestryMinimap from "./TapestryMinimap"
import RootNodeButton from "./RootNodeButton"
import LockedTooltip from "./LockedTooltip"
import Helpers from "@/utils/Helpers"
import ZoomPanHelper from "@/utils/ZoomPanHelper"
import { names } from "@/config/routes"
import * as wp from "@/services/wp"
import { interpolate } from "@/utils/interpolate"
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

      dragCoordinates: {},
      dragTimer: null,
      dragEdgeDirection: { x: 0, y: 0 },
      dragOffsetDelta: { x: 0, y: 0 },

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
    ]),
    ...mapGetters(["getNode", "getNodeNavId", "getNodeNavParent"]),
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
    empty(empty) {
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
        if (nodeId !== this.getNodeNavId) {
          this.resetNodeNavigation(nodeId)
        }
        this.updateViewBox()
      },
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
    this.clampOffset()
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
      [this.$refs.minimap.$el],
      ["vue-svg"]
    )
    this.zoomPanHelper.register()

    this.$refs.app.addEventListener("keydown", this.handleKey)
  },
  beforeDestroy() {
    this.zoomPanHelper && this.zoomPanHelper.unregister()
    this.$refs.app.removeEventListener("keydown", this.handleKey)
  },
  methods: {
    ...mapActions(["updateNodeCoordinates"]),
    ...mapMutations(["select", "unselect", "clearSelection"]),
    ...mapActions([
      "goToNodeChildren",
      "goToNodeParent",
      "goToNodeSibling",
      "resetNodeNavigation",
    ]),
    addRootNode() {
      this.$root.$emit("add-node", null)
    },
    isLoggedIn() {
      return wp.isLoggedIn()
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
      const maxNodeSize = Helpers.getNodeRadius(1, this.maxLevel, scale)
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
      this.clampOffset()

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
      this.updateOffset()
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
          this.updateScale()
        }
      )
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
      return this.isLoggedIn && this.hasPermission(node, "edit")
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
    handleNodeClick(node) {
      // zoom to the level that the node is on, and pan towards the node
      const baseRadius = Helpers.getNodeBaseRadius(node.level, this.maxLevel)
      const targetScale = 140 / baseRadius
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
          this.updateScale()
        },
        "easeOut"
      )
    },
    handleNodeDragStart(node) {
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
        if (this.nodeNavLinkMode) {
          this.$router.push({
            name: names.LINKMODAL,
            params: {
              source: this.getNodeNavParent,
              target: this.selectedId,
            },
            query: this.$route.query,
          })
        } else if (
          node.accessible ||
          Helpers.hasPermission(node, "edit", this.settings.showRejected)
        ) {
          this.$root.$emit("open-node", node.id)
        }
      } else if (code === "Tab") {
        // ? potentially let the user tab out of the main tapestry view, since the user should be fully capable of navigating through all the nodes by using just arrow keys
      } else if (code === "KeyE") {
        if (this.nodeNavLinkMode) {
          this.openSelectedLinkModal()
        } else if (Helpers.hasPermission(node, "edit", this.settings.showRejected)) {
          this.$root.$emit("edit-node", node.id)
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
    openSelectedLinkModal() {
      this.$router.push({
        name: names.LINKMODAL,
        params: {
          source: this.getNodeNavParent,
          target: this.selectedId,
        },
        query: this.$route.query,
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
