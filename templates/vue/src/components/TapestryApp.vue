<template>
  <div id="app-container" :class="{ 'sidebar-open': isSidebarOpen }">
    <div class="toolbar">
      <tapestry-filter style="z-index: 10;" />
      <div class="slider-wrapper">
        <settings-modal-button
          v-if="canEdit"
          :max-depth="maxDepth"
        ></settings-modal-button>
        <tapestry-depth-slider
          @change="updateViewBox"
          @change:max-depth="maxDepth = $event"
        ></tapestry-depth-slider>
      </div>
    </div>
    <root-node-button
      v-if="empty && canEdit"
      @click="addRootNode"
    ></root-node-button>
    <div v-if="empty && !canEdit">
      The requested Tapestry is empty.
    </div>
    <main id="tapestry" ref="app" :style="background">
      <svg id="vue-svg" :viewBox="viewBox">
        <g>
          <tapestry-link
            v-for="link in links"
            :key="`${link.source}-${link.target}`"
            :source="nodes[link.source]"
            :target="nodes[link.target]"
          ></tapestry-link>
        </g>
        <g v-if="dragSelectReady">
          <tapestry-node
            v-for="(node, id) in nodes"
            :key="id"
            :node="node"
            class="node"
            :data-id="id"
            :root="id == selectedId"
            @dragend="updateViewBox"
            @mouseover="handleMouseover(id)"
            @mouseleave="activeNode = null"
            @nodemounted="updateSelectableNodes"
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
import { mapMutations, mapState } from "vuex"
import TapestryNode from "@/components/TapestryNode"
import TapestryLink from "@/components/TapestryLink"
import TapestryDepthSlider from "@/components/TapestryDepthSlider"
import SettingsModalButton from "@/components/SettingsModalButton"
import RootNodeButton from "@/components/RootNodeButton"
import LockedTooltip from "@/components/LockedTooltip"
import TapestryFilter from "@/components/TapestryFilter"
import Helpers from "@/utils/Helpers"
import { names } from "@/config/routes"

export default {
  components: {
    TapestryNode,
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
    background() {
      return this.settings.backgroundUrl
    },
    canEdit() {
      return wpData.wpCanEditTapestry === "1"
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
  },
  watch: {
    background: {
      immediate: true,
      handler(background) {
        const app = this.$root.$el
        app.style.backgroundImage = background ? `url(${background})` : ""
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
    DragSelectModular.initializeDragSelect(this.$refs.app, this, this.nodes)
    this.updateViewBox()
    this.dragSelectReady = true
  },
  methods: {
    ...mapMutations(["select", "unselect", "clearSelection"]),
    addRootNode() {
      this.$root.$emit("add-node", null)
    },
    updateSelectableNodes() {
      DragSelectModular.updateSelectableNodes()
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
          if (x < box.x0) {
            box.x0 = x
          }
          if (y < box.y0) {
            box.y0 = y
          }
          if (x > box.x) {
            box.x = x
          }
          if (y > box.y) {
            box.y = y
          }
        }
      }

      return box
    },
  },
}
</script>

<style lang="scss" scoped>
#app-container {
  transform: scale(1);
  transform-origin: top left;
  transition: all 0.2s ease-out;
  z-index: 0;

  @media screen and (min-width: 500px) {
    &.sidebar-open {
      transform: scale(0.7);
    }
  }
}

main {
  position: relative;
  z-index: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  padding: 0 5vw;
}

.slider-wrapper {
  background: #fbfbfb;
  box-shadow: 0 0 7px 0 #ddd;
  display: flex;
  align-items: center;
  border-radius: 4px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  padding: 8px 0 8px 12px;
  position: relative;
}
</style>

<style lang="scss">
#app {
  background-size: cover;
}
</style>
