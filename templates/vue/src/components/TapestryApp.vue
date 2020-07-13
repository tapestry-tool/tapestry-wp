<template>
  <loading v-if="loading" style="height: 75vh;"></loading>
  <div v-else>
    <root-node-button
      v-if="!rootId && canEdit"
      @click="addRootNode"
    ></root-node-button>
    <div class="toolbar">
      <t-settings-modal-button></t-settings-modal-button>
      <tapestry-depth-slider @change="updateViewBox"></tapestry-depth-slider>
    </div>
    <main ref="app">
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
          ></tapestry-node>
        </g>
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
import TapestryApi from "@/services/TapestryAPI"

const client = new TapestryApi(wpPostId)

export default {
  components: {
    Loading,
    TapestryNode,
    TapestryLink,
    TapestryDepthSlider,
    TSettingsModalButton,
    RootNodeButton,
  },
  data() {
    return {
      loading: true,
      viewBox: "2200 2700 1600 1100",
    }
  },
  computed: {
    ...mapState([
      "nodes",
      "links",
      "selectedNodeId",
      "tapestryIsLoaded",
      "rootId",
      "selection",
    ]),
    canEdit() {
      return wpApiSettings && wpApiSettings.wpCanEditTapestry === "1"
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
  },
}
</script>

<style lang="scss" scoped>
main {
  position: relative;
}
</style>
