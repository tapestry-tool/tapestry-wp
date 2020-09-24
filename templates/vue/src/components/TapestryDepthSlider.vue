<template>
  <div v-if="maxDepth > 1 && settings.defaultDepth > 0" class="depth-slider">
    <div>
      <tapestry-icon icon="zoom-in"></tapestry-icon>
      <input
        v-model="currentDepth"
        class="slider"
        type="range"
        min="1"
        :max="maxDepth"
      />
      <tapestry-icon icon="zoom-out"></tapestry-icon>
    </div>
    <p v-if="currentDepth < maxDepth" class="warning-text alert p-2 small">
      Some nodes might be hidden because you're not at maximum depth.
    </p>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex"
import TapestryIcon from "@/components/TapestryIcon"
import { bus } from "@/utils/event-bus"

export default {
  components: {
    TapestryIcon,
  },
  computed: {
    ...mapState(["nodes", "settings"]),
    ...mapGetters(["getNeighbours", "getNode"]),
    currentDepth: {
      get() {
        const { depth } = this.$route.query
        if (depth) {
          return Number(depth)
        }
        return this.settings.defaultDepth
      },
      set(depth) {
        if (depth !== this.currentDepth) {
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
    levels() {
      if (!Object.keys(this.nodes).length) {
        return []
      }

      const levels = {}
      const queue = []
      const visited = new Set()

      queue.push(this.selectedNodeId)
      visited.add(this.selectedNodeId)
      levels[this.selectedNodeId] = 0

      while (queue.length > 0) {
        const currentNodeId = queue.shift()
        const neighbours = this.getNeighbours(currentNodeId)
        neighbours
          .filter(childId => !visited.has(childId))
          .forEach(childId => {
            levels[childId] = levels[currentNodeId] + 1
            queue.push(childId)
            visited.add(childId)
          })
      }

      const levelsArray = []
      Object.entries(levels).forEach(([nodeId, level]) => {
        const nodesAtLevel = levelsArray[level] || []
        nodesAtLevel.push(nodeId)
        levelsArray[level] = nodesAtLevel
      })
      return levelsArray
    },
    maxDepth() {
      return this.levels.length
    },
  },
  watch: {
    currentDepth: {
      immediate: true,
      handler: function(depth) {
        if (depth > this.maxDepth) {
          this.$router.replace({
            ...this.$route,
            query: { ...this.$route.query, depth: this.maxDepth },
          })
        } else {
          this.updateNodeTypes()
        }
      },
    },
    levels: {
      immediate: true,
      handler: function() {
        this.updateNodeTypes()
      },
    },
    maxDepth: {
      immediate: true,
      handler: function(maxDepth) {
        bus.$emit("max-depth-change", maxDepth)
      },
    },
  },
  methods: {
    ...mapMutations(["updateNode"]),
    updateNodeTypes() {
      const depth = parseInt(this.currentDepth)
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
    },
  },
}
</script>

<style lang="scss" scoped>
.depth-slider {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

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
  outline: none;
  background: #d3d3d3;
  height: 10px;
  opacity: 0.8;
  transition: opacity 0.2s;
  position: relative;
  align-items: center;

  &:before,
  &:after {
    position: absolute;
    content: "";
    width: 30px;
    height: 30px;
    background-size: 20px;
    background-position: center;
    background-repeat: no-repeat;
    border: 1px solid #dfdfdf;
    border-radius: 50%;
    left: -30px;
    bottom: -9px;
  }

  &:after {
    left: initial;
    right: -30px;
  }

  /* webkit support */
  &::-webkit-slider-thumb {
    border: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ed7565;
    cursor: pointer;
  }

  /* mozilla support */
  &::-moz-range-thumb {
    border: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ed7565;
  }

  /* internet explorer support */
  &::-ms-thumb {
    border: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ed7565;
  }

  &:hover {
    opacity: 1;
  }

  &:focus {
    border-color: transparent !important;
    outline: none !important;
  }
}

.warning-text {
  position: absolute;
  width: 100%;
  top: calc(100% - 1px);
  box-shadow: 0 7px 7px 0 #ddd;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  background-color: #fbfbfb;
}
</style>
