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
import { tydeTypes } from "@/utils/constants"
import { names } from "@/config/routes"

export default {
  props: {
    nodeId: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getParent", "getDirectChildren", "getNode", "getNeighbours"]),
    ...mapState(["nodes", "rootId"]),
    parent() {
      return this.getNode(this.getParent(this.nodeId)) || null
    },
    isRoot() {
      return this.parent === undefined
    },
    isDisabled() {
      const node = this.getNode(this.nodeId).tydeType
      if (node.tydeType === tydeTypes.MODULE || node.tydeType === tydeTypes.STAGE) {
        return this.getDirectChildren(this.nodeId).length > 0
      }
      if (this.isRoot) {
        return Object.keys(this.nodes).length > 1
      } else {
        return this.getNeighbours(this.nodeId).length > 1
      }
    },
    disabledMessage() {
      const node = this.getNode(this.nodeId)
      if (this.isDisabled) {
        if (
          node.tydeType === tydeTypes.MODULE ||
          node.tydeType === tydeTypes.STAGE
        ) {
          return `You cannot delete this node because this ${node.tydeType} node still has children.`
        }
        return this.isRoot
          ? "Root node can only be deleted if there are no other nodes in the tapestry."
          : "Only nodes with a single connection can be deleted."
      }
      return null
    },
  },
  methods: {
    ...mapActions(["deleteNode", "deleteLink"]),
    ...mapMutations(["updateSelectedNode", "updateNode"]),
    removeNode() {
      this.$emit("submit")
      this.updateSelectedNode(this.rootId)
      if (!this.isRoot) {
        this.deleteLink({ source: this.parent.id, target: this.nodeId })
        this.updateNode({
          id: this.parent.id,
          newNode: {
            childOrdering: this.parent.childOrdering.filter(
              id => id !== this.nodeId
            ),
          },
        })
        this.$router.push({
          name: names.APP,
          params: { nodeId: this.parent.id },
          query: this.$route.query,
        })
      } else {
        this.$router.push({ path: "/", query: this.$route.query })
      }
      this.deleteNode(this.nodeId)
    },
  },
}
</script>

<style lang="scss" scoped>
button:disabled {
  cursor: not-allowed;
}
</style>
