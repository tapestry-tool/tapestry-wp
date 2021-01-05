<template>
  <div id="app-container" :class="{ 'sidebar-open': isSidebarOpen }">
    <div class="toolbar">
      <tapestry-filter v-if="!showMap" style="z-index: 10;" />
      <div v-show="canEdit || (!showMap && hasDepth)" class="slider-wrapper">
        <settings-modal-button
          v-if="canEdit"
          :max-depth="maxDepth"
        ></settings-modal-button>
        <tapestry-depth-slider
          v-show="!showMap && hasDepth"
          @change="updateViewBox"
          @change:max-depth="maxDepth = $event"
        ></tapestry-depth-slider>
      </div>
    </div>
    <tapestry-map
      v-if="settings.renderMap"
      :is-sidebar-open="isSidebarOpen"
      data-qa="tapestry-map"
    />
    <main v-else id="tapestry" ref="app" :style="background">
      <div v-if="empty">
        <root-node-button v-if="canEdit" @click="addRootNode"></root-node-button>
        <div v-else class="empty-message">The requested Tapestry is empty.</div>
      </div>
      <svg v-else id="vue-svg" :viewBox="viewBox">
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
            class="node"
            :class="{ selectable: nodeIsEditable(node) }"
            :data-id="id"
            :root="id == selectedId"
            @dragend="updateViewBox"
            @mouseover="handleMouseover(id)"
            @mouseleave="activeNode = null"
            @mounted="
              dragSelectEnabled && nodeIsEditable(node)
                ? updateSelectableNodes(node)
                : null
            "
          ></tapestry-node>
        </g>
        <locked-tooltip
          v-if="activeNode"
          :node="nodes[activeNode]"
          :viewBox="viewBox"
        ></locked-tooltip>
      </svg>
    </main>
  </div>
</template>

<script>
import DragSelectModular from "@/utils/dragSelectModular"
import client from "../services/TapestryAPI"
import { mapMutations, mapState } from "vuex"
import TapestryNode from "@/components/TapestryNode"
import TapestryMap from "@/components/TapestryMap"
import TapestryLink from "@/components/TapestryLink"
import TapestryDepthSlider from "@/components/TapestryDepthSlider"
import SettingsModalButton from "@/components/SettingsModalButton"
import RootNodeButton from "@/components/RootNodeButton"
import LockedTooltip from "@/components/LockedTooltip"
import TapestryFilter from "@/components/TapestryFilter"
import Helpers from "@/utils/Helpers"
import { names } from "@/config/routes"
import * as wp from "@/services/wp"

export default {
  components: {
    TapestryNode,
    TapestryMap,
    TapestryLink,
    TapestryDepthSlider,
    TapestryFilter,
    SettingsModalButton,
    RootNodeButton,
    LockedTooltip,
  },
  data() {
    return {
      loading: true,
      viewBox: "2200 2700 1600 1100",
      activeNode: null,
      maxDepth: 0,
      dragSelectReady: false,
    }
  },
  computed: {
    ...mapState(["nodes", "links", "selection", "settings", "rootId"]),
    analyticsEnabled() {
      return this.settings.enableAnalytics
    },
    background() {
      return this.settings.backgroundUrl
    },
    canEdit() {
      return wp.canEditTapestry()
    },
    hasDepth() {
      return this.maxDepth > 1 && this.settings.defaultDepth > 0
    },
    showMap() {
      return this.settings.renderMap
    },
    empty() {
      return Object.keys(this.nodes).length === 0
    },
    selectedId() {
      return Number(this.$route.params.nodeId)
    },
    isSidebarOpen() {
      return Boolean(this.$route.query.sidebar)
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
    analyticsEnabled: {
      immediate: true,
      handler(analyticsEnabled) {
        client.enableAnalytics(analyticsEnabled)
      },
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
      },
    },
  },
  mounted() {
    if (this.dragSelectEnabled) {
      DragSelectModular.initializeDragSelect(this.$refs.app, this, this.nodes)
    }
    this.updateViewBox()
    this.dragSelectReady = true
    this.$root.$on("open-node", id => {
      this.openNode(id)
    })
    this.$root.$on("edit-node", id => {
      this.editNode(id)
    })
  },
  methods: {
    ...mapMutations(["select", "unselect", "clearSelection"]),
    addRootNode() {
      this.$root.$emit("add-node", null)
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

        this.viewBox = `${tapestryDimensions.startX} ${
          tapestryDimensions.startY
        } ${Math.max(
          tapestryDimensions.width - tapestryDimensions.startX,
          MIN_WIDTH
        )} ${Math.max(
          tapestryDimensions.height - tapestryDimensions.startY,
          MIN_HEIGHT
        )}`
      }
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
    openNode(id) {
      this.$router.push({
        name: names.LIGHTBOX,
        params: { nodeId: id },
        query: this.$route.query,
      })
    },
    editNode(id) {
      this.$router.push({
        name: names.MODAL,
        params: { nodeId: id, type: "edit", tab: "content" },
        query: this.$route.query,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
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
.toolbar {
  display: flex;
  justify-content: space-between;
  padding: 0 5vw;
  transition: all 0.2s ease-out;
}
.slider-wrapper {
  background: #fbfbfb;
  box-shadow: 0 0 7px 0 #ddd;
  display: flex;
  align-items: center;
  border-radius: 4px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  padding: 8px 6px 8px 12px;
  margin-left: auto;
  position: relative;
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
