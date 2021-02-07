<template>
  <div>
    <b-button :disabled="isDisabled" size="sm" variant="danger" @click="removeNode">
      Delete Node
    </b-button>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex"
import { names } from "@/config/routes"

export default {
  props: {
    nodeId: {
      type: Number,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    ...mapGetters(["getNode", "getNeighbours", "getNeighbouringLinks"]),
    ...mapState(["nodes", "rootId"]),
    neighbourLink() {
      return this.getNeighbouringLinks(this.nodeId)[0]
    },
    neighbour() {
      return this.getNode(this.getNeighbours(this.nodeId)[0])
    },
    isRoot() {
      return this.nodeId === this.rootId
    },
    isDisabled() {
      return Boolean(this.disabled || this.disabledMessage.length)\
    },
    disabledMessage() {
      if (this.isRoot && Object.keys(this.nodes).length > 1) {
        return "Root node can only be deleted if there are no other nodes in the tapestry."
      }
      if (this.getNeighbouringLinks(this.nodeId).length > 1) {
        return "Only nodes with a single connection can be deleted."
      }
      return ""
    },
  },
  mounted() {
    if (this.isDisabled) {
      this.$emit("message", this.disabledMessage)
    }
  },
  methods: {
    ...mapActions(["deleteNode", "deleteLink"]),
    ...mapMutations(["updateSelectedNode", "updateNode"]),
    removeNode() {
      this.$emit("submit")
      this.updateSelectedNode(this.rootId)
      if (!this.isRoot) {
        this.deleteLink({
          source: this.neighbourLink.source,
          target: this.neighbourLink.target,
        })
        this.updateNode({
          id: this.neighbour.id,
          newNode: {
            childOrdering: this.neighbour.childOrdering.filter(
              id => id !== this.nodeId
            ),
          },
        })
        this.$router.push({
          name: names.APP,
          params: { nodeId: this.neighbour.id },
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
