<template>
  <div>
    <b-button
      :disabled="isDisabled"
      size="sm"
      variant="danger"
      @click="handleRemoveNode"
    >
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
      if (this.disabled) {
        return true
      } else if (this.isRoot) {
        return Object.keys(this.nodes).length > 1
      } else {
        return this.getNeighbouringLinks(this.nodeId).length > 1
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
  mounted() {
    this.$emit("message", this.disabledMessage)
  },
  methods: {
    ...mapActions(["deleteNode", "deleteLink", "getNodeHasDraftNeighbours"]),
    ...mapMutations(["updateSelectedNode", "updateNode"]),
    async handleRemoveNode() {
      this.$emit("setLoading", true)
      this.updateSelectedNode(this.rootId)
      const hasDraftNeighbours = await this.getNodeHasDraftNeighbours(this.nodeId)
      if (hasDraftNeighbours) {
        this.$bvModal
          .msgBoxConfirm(
            "There are draft nodes attached to this node. Deleting this node will also remove the draft nodes. Are you sure you want to continue?",
            {
              modalClass: "node-modal-confirmation",
              title: "Are you sure you want to continue?",
              okTitle: "Yes, Delete!",
              okVariant: "danger",
            }
          )
          .then(close => {
            if (close) {
              this.removeNode()
            }
          })
          .catch(err => console.log(err))
      } else {
        this.removeNode()
      }
    },
    removeNode() {
      if (!this.isRoot) {
        this.deleteLink({
          source: this.neighbourLink.source,
          target: this.neighbourLink.target,
          useClient: false,
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
      this.$emit("setLoading", false)
    },
  },
}
</script>

<style lang="scss" scoped>
button:disabled {
  cursor: not-allowed;
}
</style>
