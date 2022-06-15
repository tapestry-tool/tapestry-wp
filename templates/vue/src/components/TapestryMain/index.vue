<template>
  <main id="tapestry" ref="app" :style="background" :class="{ panning: isPanning }">
    <div v-if="empty">
      <root-node-button v-if="canEdit" @click="addRootNode"></root-node-button>
      <div v-else class="empty-message">The requested Tapestry is empty.</div>
    </div>
    <svg v-else id="vue-svg" :viewBox="computedViewBox">
      <defs>
        <filter v-for="i in maxLevel" :id="'shadow-' + i" :key="i">
          <!-- <feDropShadow :dx="(2**i)*3" :dy="(2**i)*3" stdDeviation="4" flood-opacity="0.2" /> -->
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
          <feOffset :dx="6 * (maxLevel - i)" :dy="6 * (maxLevel - i)" />
          <feComponentTransfer>
            <feFuncA type="linear" :slope="Math.max(0.6 - i * 0.1, 0.1)" />
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
  props: {
    viewBox: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      dragSelectReady: false,
      activeNode: null,
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
        this.offset.y} ${this.viewBox[2] / this.scale} ${this.viewBox[3] /
        this.scale}`
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
    if (this.$route.query.scale) {
      const scale = Number(this.$route.query.scale)
      if (!isNaN(scale) && scale >= 1) {
        this.scale = scale
      }
    }
    if (this.$route.query.x) {
      const x = Number(this.$route.query.x)
      if (!isNaN(x)) {
        this.offset.x = x
      }
    }
    if (this.$route.query.y) {
      const y = Number(this.$route.query.y)
      if (!isNaN(y)) {
        this.offset.y = y
      }
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
        if (!this.appDimensions) {
          this.fetchAppDimensions()
        }
        const { width, height } = this.appDimensions
        x = (x / width) * (this.viewBox[2] / this.scale)
        y = (y / height) * (this.viewBox[3] / this.scale)
        const newScale = Math.max(this.scale + delta, 1)
        const scaleChange = newScale / this.scale
        const newX = x / scaleChange
        const newY = y / scaleChange
        this.offset.x += x - newX
        this.offset.y += y - newY
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
        dx = (dx / width) * (this.viewBox[2] / this.scale)
        dy = (dy / height) * (this.viewBox[3] / this.scale)
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
      this.$parent.updateViewBox()
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
