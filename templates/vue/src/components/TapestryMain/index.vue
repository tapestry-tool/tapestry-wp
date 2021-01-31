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
</template>

<script>
import DragSelectModular from "@/utils/dragSelectModular"
import { mapMutations, mapState } from "vuex"
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
  },
  computed: {
    ...mapState(["nodes", "links", "selection", "settings", "rootId"]),
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
