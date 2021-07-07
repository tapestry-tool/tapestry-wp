<template>
  <main id="tapestry" ref="app" :style="background">
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
          v-for="(node, id) in orderedNodes"
          :key="node.id"
          :node="node"
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
        :viewBox="viewBox"
      ></locked-tooltip>
    </svg>
  </main>
</template>

<script>
import DragSelectModular from "@/utils/dragSelectModular"
import { mapMutations, mapState, mapGetters } from "vuex"
import TapestryNode from "./TapestryNode"
import TapestryLink from "./TapestryLink"
import RootNodeButton from "./RootNodeButton"
import LockedTooltip from "./LockedTooltip"
import Helpers from "@/utils/Helpers"
import { names } from "@/config/routes"
import * as wp from "@/services/wp"

export default {
  components: {
    TapestryNode,
    TapestryLink,
    RootNodeButton,
    LockedTooltip,
  },
  props: ["viewBox"],
  data() {
    return {
      dragSelectReady: false,
      activeNode: null,
    }
  },
  mounted() {
    if (this.dragSelectEnabled) {
      DragSelectModular.initializeDragSelect(this.$refs.app, this, this.nodes)
    }
    this.updateViewBox()
    this.dragSelectReady = true
    this.$nextTick(function() {
      let gContainer = document.getElementsByClassName("nodes")[0]
      console.log(gContainer.children)
      let temp = Array.from(gContainer.children)
      temp.sort((a, b) => (a.height > b.height) ? 1 : ((b.height > a.height) ? -1 : 0))
      console.log(temp)
      gContainer.innerHTML = ''
      for (let node of temp) {
        gContainer.appendChild(node)
      }
    })
  },
  computed: {
    ...mapState(["nodes", "links", "selection", "settings", "rootId"]),
    orderedNodes: function() {
      let order = this.computeTabOrder(this.nodes)
      return order
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
    nodes: {
      immediate: true,
      handler(nodes) {
        // this.computeTabOrder(nodes)
      },
    },
  },
  methods: {
    ...mapMutations(["select", "unselect", "clearSelection"]),
    ...mapGetters(["getNode", "isMultiContent", "isMultiContentRow"]),
    addRootNode() {
      this.$root.$emit("add-node", null)
    },
    computeTabOrder(nodes) {
      const rootNodeId = this.rootId
      let newNodeOrder = {}
      let queue = [rootNodeId]
      let counter = 1
      while (queue.length) {
        const queueLength = queue.length

        for (let i = 0; i < queueLength; i++) {
          const nodeId = queue.shift()
          const node = this.getNodeFromObject(nodes, nodeId)
          const nodeHTML = document.querySelector(`[data-qa="node-${nodeId}"]`)
          // console.log(`[data-qa="node-${nodeId}]`)
          // console.log(nodeHTML)
          // nodeHTML.tabIndex = counter
          node.htmlOrdering = counter
          for (const childId of node.childOrdering) {
            queue.push(childId)
          }
          newNodeOrder[nodeId] = node
          counter++
        }
      }
      return newNodeOrder
    },
    getNodeFromObject(nodes, id) {
      return nodes[id]
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
