<template>
  <loading v-if="loading" style="height: 75vh;"></loading>
  <div v-else>
    <div class="toolbar">
      <tapestry-filter />
      <div class="slider-wrapper">
        <t-settings-modal-button></t-settings-modal-button>
        <tapestry-depth-slider @change="updateViewBox"></tapestry-depth-slider>
      </div>
    </div>
    <root-node-button
      v-if="empty && canEdit"
      @click="addRootNode"
    ></root-node-button>
    <div v-if="empty && !canEdit">
      The requested Tapestry is empty.
    </div>
    <main ref="app" :style="background">
      <svg id="vue-svg" :viewBox="viewBox">
        <g>
          <tapestry-link
            v-for="link in links"
            :key="`${link.source}-${link.target}`"
            :source="nodes[link.source]"
            :target="nodes[link.target]"
          ></tapestry-link>
        </g>
        <g>
          <tapestry-node
            v-for="(node, id) in nodes"
            :key="id"
            :node="node"
            class="node"
            :data-id="id"
            :root="id == selectedNodeId"
            @dragend="updateViewBox"
            @mouseover="handleMouseover(id)"
            @mouseleave="activeNode = null"
          ></tapestry-node>
        </g>
        <locked-tooltip v-if="activeNode" :node="nodes[activeNode]"></locked-tooltip>
      </svg>
    </main>
  </div>
</template>

<script>
import DragSelect from "dragselect"
import { mapMutations, mapState } from "vuex"
import Loading from "@/components/Loading"
import TapestryNode from "@/components/TapestryNode"
import TapestryLink from "@/components/TapestryLink"
import TapestryDepthSlider from "@/components/TapestryDepthSlider"
import TSettingsModalButton from "@/components/TSettingsModalButton"
import RootNodeButton from "@/components/RootNodeButton"
import LockedTooltip from "@/components/LockedTooltip"
import TapestryApi from "@/services/TapestryAPI"
import TapestryFilter from "@/components/TapestryFilter"

const client = new TapestryApi(wpPostId)

export default {
  components: {
    Loading,
    TapestryNode,
    TapestryLink,
    TapestryDepthSlider,
    TapestryFilter,
    TSettingsModalButton,
    RootNodeButton,
    LockedTooltip,
  },
  data() {
    return {
      loading: true,
      viewBox: "2200 2700 1600 1100",
      activeNode: null,
    }
  },
  computed: {
    ...mapState([
      "nodes",
      "links",
      "selectedNodeId",
      "tapestryIsLoaded",
      "selection",
      "settings",
    ]),
    background() {
      return this.settings.backgroundUrl
    },
    canEdit() {
      return wpApiSettings && wpApiSettings.wpCanEditTapestry === "1"
    },
    empty() {
      return Object.keys(this.nodes).length === 0
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
  },
  mounted() {
    const data = [client.getTapestry(), client.getUserProgress()]
    Promise.all(data).then(([dataset, progress]) => {
      this.init({ dataset, progress })
      this.loading = false
      this.$nextTick(this.initializeDragSelect)
    })
  },
  methods: {
    ...mapMutations(["init", "select", "unselect", "clearSelection"]),
    addRootNode() {
      this.$root.$emit("add-node", null)
    },
    initializeDragSelect() {
      document.addEventListener("keydown", evt => {
        if (evt.key === "Escape") {
          this.clearSelection()
        }
      })

      new DragSelect({
        selectables: document.querySelectorAll(".node"),
        area: this.$refs.app,
        onDragStart: evt => {
          if (evt.ctrlKey || evt.metaKey || evt.shiftKey) {
            return
          }
          this.clearSelection()
        },
        onElementSelect: el => this.select(el.dataset.id),
        onElementUnselect: el => this.unselect(el.dataset.id),
      })
    },
    updateViewBox() {
      const box = {
        minX: 2200,
        minY: 3000,
        width: 3800,
        height: 3800,
      }

      for (const node of Object.values(this.nodes)) {
        if (node.nodeType !== "") {
          const { x, y } = node.coordinates
          if (x < box.minX) {
            box.minX = x
          }
          if (y < box.minY) {
            box.minY = y
          }
          if (x > box.width) {
            box.width = x
          }
          if (y > box.height) {
            box.height = y
          }
        }
      }

      const { minX, minY, width, height } = box
      this.viewBox = `${minX - 300} ${minY - 300} ${width - minX + 600} ${height -
        minY +
        600}`
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
main {
  position: relative;
}

.toolbar {
  display: flex;
  justify-content: space-between;
}

.slider-wrapper {
  background: #fbfbfb;
  box-shadow: 0 0 7px 0 #ddd;
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 8px 0 8px 12px;
  position: relative;
}
</style>

<style lang="scss">
#app {
  background-size: cover;
}
</style>
