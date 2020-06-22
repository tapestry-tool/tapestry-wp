<template>
  <div class="depth-slider">
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
    ...mapGetters(["getNeighbours"]),
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
          this.currentDepth = Math.floor((this.maxDepth - 1) / 2)
        }
      },
    },
  },
  created() {
    this.currentDepth = Math.floor((this.maxDepth - 1) / 2)
  },
  methods: {
    ...mapMutations(["updateNode"]),
    updateNodeTypes() {
      const depth = parseInt(this.currentDepth)
      this.nodes.forEach(node => {
        if (node.id !== this.selectedNodeId) {
          this.updateNode({
            id: node.id,
            newNode: {
              nodeType: "child",
            },
          })
        }
      })
      const nodesAtCurrentDepth = this.levels[depth]
      if (nodesAtCurrentDepth) {
        nodesAtCurrentDepth.forEach(nodeId => {
          this.updateNode({
            id: nodeId,
            newNode: {
              nodeType: "grandchild",
            },
          })
        })
      }
      const hiddenNodes = this.levels
        .filter((_, level) => level > depth)
        .flatMap(nodes => nodes)
      hiddenNodes.forEach(nodeId => {
        this.updateNode({
          id: nodeId,
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
  position: absolute;
  right: 0;
  top: 0;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
</style>
