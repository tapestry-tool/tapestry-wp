<template>
  <div>
    <b-button :disabled="isDisabled" size="sm" variant="danger" @click="removeNode">
      Delete Node
    </b-button>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex"

export default {
  props: {
    nodeId: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getDirectParents", "getNode", "getNeighbours"]),
    ...mapState(["nodes", "rootId"]),
    parent() {
      const parents = this.getDirectParents(this.nodeId)
      return parents && parents[0] ? this.getNode(parents[0]) : null
    },
    isRoot() {
      return this.parent === null
    },
    isDisabled() {
      if (this.isRoot) {
        return Object.keys(this.nodes).length > 1
      } else {
        return this.getNeighbours(this.nodeId).length > 1
      }
    },
    disabledMessage() {
      if (this.isDisabled) {
        return this.isRoot
          ? "Root node can only be deleted if there are no other nodes in the tapestry."
          : "Only nodes with a single connection can be deleted or made into drafts."
      }
      return null
    },
  },
  mounted() {
    this.$emit("message", this.disabledMessage)
  },
  methods: {
    ...mapActions(["deleteNode", "deleteLink"]),
    ...mapMutations(["updateSelectedNode", "updateNode"]),
    removeNode() {
      this.updateSelectedNode(this.rootId)
      if (this.parent) {
        this.deleteLink({ source: this.parent.id, target: this.nodeId })
        this.updateNode({
          id: this.parent.id,
          newNode: {
            childOrdering: this.parent.childOrdering.filter(
              id => id !== this.nodeId
            ),
          },
        })
      }
      this.deleteNode(this.nodeId).then(() => {
        this.$emit("submit")
      })
    },
  },
}
</script>

<style lang="scss" scoped>
button:disabled {
  cursor: not-allowed;
}
</style>
