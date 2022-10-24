<template>
  <div v-if="maxDepth > 1" class="depth-slider">
    <div>
      <input
        v-model="currentDepth"
        aria-label="Change the depth of the Tapestry view"
        class="slider"
        type="range"
        min="1"
        :max="maxDepth"
        :style="{ '--zoomInBg': zoomInBg, '--zoomOutBg': zoomOutBg }"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex"
import ZoomIn from "@/assets/zoom-in.png"
import ZoomOut from "@/assets/zoom-out.png"
import Helpers from "@/utils/Helpers"
import client from "@/services/TapestryAPI"

export default {
  computed: {
    ...mapState(["nodes", "settings", "maxLevel"]),
    ...mapGetters(["getNeighbours", "getNode"]),
    currentDepth: {
      get() {
        return this.$store.state.currentDepth
      },
      set(depth) {
        depth = parseInt(depth)
        if (!Number.isInteger(depth)) {
          return
        }
        depth = Math.max(1, Math.min(depth, this.maxDepth))
        if (depth !== this.currentDepth) {
          this.setCurrentDepth(depth)
          this.$router.push({
            ...this.$route,
            query: { ...this.$route.query, depth },
          })
        }
      },
    },
    selectedNodeId() {
      return Number(this.$route.params.nodeId)
    },
    maxDepth() {
      return this.maxLevel - 1
    },
    zoomInBg() {
      return "url(" + Helpers.getImagePath(ZoomIn) + ")"
    },
    zoomOutBg() {
      return "url(" + Helpers.getImagePath(ZoomOut) + ")"
    },
  },
  watch: {
    currentDepth(depth, oldDepth) {
      if (oldDepth && depth != oldDepth) {
        client.recordAnalyticsEvent("user", "adjust", "depth", null, {
          from: oldDepth,
          to: depth,
        })
      }
    },
    levels: {
      immediate: true,
      handler: function() {
        this.updateNodeTypes()
      },
    },
  },
  created() {
    const { depth } = this.$route.query
    if (depth) {
      this.currentDepth = depth
    }
  },
  methods: {
    ...mapMutations(["updateNode", "setCurrentDepth"]),
    updateNodeTypes() {
      // TODO: remove code elsewhere that is related to nodeType check, and safely delete the code below.
      /*
      const depth = parseInt(this.currentDepth)

      if (depth === 0) {
        const nodesToUpdate = Object.values(this.nodes).filter(
          node => node.nodeType !== "child"
        )
        nodesToUpdate.forEach(node => {
          this.updateNode({
            id: node.id,
            newNode: {
              nodeType: "child",
            },
          })
        })
        this.$emit("change")
        return
      }

      const updated = new Set()
      const nodesAtCurrentDepth = this.levels[depth]
      if (nodesAtCurrentDepth) {
        const nodesToUpdate = nodesAtCurrentDepth.filter(nodeId => {
          updated.add(parseInt(nodeId))
          const node = this.getNode(nodeId)
          return node.nodeType !== "grandchild"
        })
        nodesToUpdate.forEach(nodeId => {
          this.updateNode({
            id: nodeId,
            newNode: {
              nodeType: "grandchild",
            },
          })
        })
      }
      const children = this.levels
        .slice(0, depth)
        .flatMap(nodes => nodes)
        .filter(nodeId => {
          updated.add(parseInt(nodeId))
          const node = this.getNode(nodeId)
          return node.nodeType !== "child"
        })
      children.forEach(nodeId => {
        this.updateNode({
          id: nodeId,
          newNode: {
            nodeType: "child",
          },
        })
      })
      const hidden = Object.values(this.nodes).filter(
        node =>
          !updated.has(node.id) &&
          node.id !== this.selectedNodeId &&
          node.nodeType !== ""
      )
      hidden.forEach(node => {
        this.updateNode({
          id: node.id,
          newNode: {
            nodeType: "",
          },
        })
      })
      this.$emit("change")
      */
    },
  },
}
</script>

<style lang="scss" scoped>
.depth-slider {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  position: absolute;
  right: 36px;
  bottom: 0;
  transform-origin: bottom right;
  transform: rotate(90deg);

  div {
    img {
      width: 20px;
      margin-top: -5px;

      &:first-child {
        margin-left: 15px;
        margin-right: -1px;
      }
      &:last-child {
        margin-right: 15px;
      }
    }
  }

  p {
    display: block;
  }
}

.slider {
  -webkit-appearance: none;
  background: var(--bg-color-primary);
  width: 100px;
  height: 10px;
  position: relative;
  align-items: center;
  margin: 0 30px;
  border: solid 2px #c2c2c2;

  &:before,
  &:after {
    position: absolute;
    content: "";
    width: 30px;
    height: 30px;
    background: #fff var(--zoomInBg);
    background-size: 20px;
    background-position: center;
    background-repeat: no-repeat;
    border: 1px solid var(--bg-color-primary);
    border-radius: 50%;
    left: -20px;
    bottom: -9px;
  }

  &:after {
    background-image: var(--zoomOutBg);
    left: initial;
    right: -20px;
  }

  /* webkit support */
  &::-webkit-slider-thumb {
    border: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--highlight-color);
    cursor: pointer;
  }

  /* mozilla support */
  &::-moz-range-thumb {
    border: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--highlight-color);
  }

  /* internet explorer support */
  &::-ms-thumb {
    border: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--highlight-color);
  }

  &:focus {
    border-color: #c2c2c2 !important;
  }
}
</style>
