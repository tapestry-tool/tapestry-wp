<template>
  <div v-if="maxDepth > 1" class="depth-slider">
    <input v-model="currentDepth" type="range" min="1" :max="maxDepth" />
    <p v-if="currentDepth < maxDepth">
      Some nodes might be hidden because you're not at max depth.
    </p>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex"

export default {
  data() {
    return {
      currentDepth: 1,
    }
  },
  computed: {
    ...mapState(["selectedNodeId", "nodes"]),
    ...mapGetters(["getNeighbours", "getNode"]),
    levels() {
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
      handler: function() {
        this.updateNodeTypes()
      },
    },
    levels: {
      immediate: true,
      handler: function() {
        this.updateNodeTypes()
        if (this.currentDepth > this.maxDepth) {
          this.setDefaultDepth()
        }
      },
    },
  },
  created() {
    this.setDefaultDepth()
  },
  methods: {
    ...mapMutations(["updateNode"]),
    setDefaultDepth() {
      this.currentDepth = Math.min(3, Math.ceil((this.maxDepth - 1) / 2))
    },
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
        console.log("grandchildren", nodesToUpdate)
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
      console.log("children", children)
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
      console.log("hidden", hidden)
      hidden.forEach(node => {
        this.updateNode({
          id: node.id,
          newNode: {
            nodeType: "",
          },
        })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.depth-slider {
  border-left: 1px solid #a1a1a1;
  padding-left: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  p {
    display: block;
  }
}
</style>
