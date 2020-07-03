<template>
  <div>
    <b-button :disabled="isDisabled" size="sm" variant="danger" @click="removeNode">
      Delete Node
    </b-button>
    <b-form-invalid-feedback :state="!isDisabled">
      {{ disabledMessage }}
    </b-form-invalid-feedback>
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
        return this.nodes.length > 1
      } else {
        return this.getNeighbours(this.nodeId).length > 1
      }
    },
    disabledMessage() {
      if (this.isDisabled) {
        return this.isRoot
          ? "Root node can only be deleted if there are no other nodes in the tapestry."
          : "Only nodes with a single connection can be deleted."
      }
      return null
    },
  },
  methods: {
    ...mapActions(["deleteNode", "deleteLink"]),
    ...mapMutations(["updateSelectedNode"]),
    removeNode() {
      this.updateSelectedNode(this.rootId)
      if (this.parent) {
        this.deleteLink([this.parent.id, this.nodeId])
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
