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
import { tydeTypes } from "@/utils/constants"
import { nodeStatus } from "@/utils/constants"
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
    ...mapGetters([
      "getParent",
      "getDirectChildren",
      "getNode",
      "getNeighbours",
      "getNeighbouringLinks",
    ]),
    ...mapState(["nodes", "rootId"]),
    parent() {
      return this.getNode(this.getParent(this.nodeId)) || null
    },
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
      }
      const node = this.getNode(this.nodeId).tydeType
      if (node.tydeType === tydeTypes.MODULE || node.tydeType === tydeTypes.STAGE) {
        return this.getDirectChildren(this.nodeId).length > 0
      }
      if (this.isRoot) {
        return Object.keys(this.nodes).length > 1
      } else {
        return this.getNeighbouringLinks(this.nodeId).length > 1
      }
    },
    disabledMessage() {
      const node = this.getNode(this.nodeId)
      if (node.tydeType === tydeTypes.MODULE || node.tydeType === tydeTypes.STAGE) {
        return `You cannot delete this node because this ${node.tydeType} node still has children.`
      }
      if (this.isRoot && Object.keys(this.nodes).length > 1) {
        return "Root node can only be deleted if there are no other nodes in the tapestry."
      }
      const nonDraftNeighbours = this.getNeighbouringLinks(this.nodeId).filter(
        link => {
          const node = this.getNode(
            this.nodeId == link.source ? link.target : link.source
          )
          return node.status !== nodeStatus.DRAFT
        }
      )
      if (nonDraftNeighbours.length > 1) {
        return "Only nodes with a single connection can be deleted."
      }
      return null
    },
  },
  mounted() {
    this.$emit("message", this.disabledMessage)
  },
  methods: {
    ...mapActions(["deleteNode", "deleteLink", "getNodeHasDraftChildren"]),
    ...mapMutations(["updateSelectedNode", "updateNode"]),
    async handleRemoveNode() {
      this.$emit("setLoading", true)
      this.updateSelectedNode(this.rootId)
      const nodeHasDraftChildren = await this.getNodeHasDraftChildren(this.nodeId)
      if (nodeHasDraftChildren.hasDraft) {
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
      this.$emit("setLoading", false)
    },
    removeNode() {
      if (!this.isRoot) {
        const neighbour = this.neighbour
        this.deleteLink({
          source: this.neighbourLink.source,
          target: this.neighbourLink.target,
          useClient: false,
        })
        this.updateNode({
          id: neighbour.id,
          newNode: {
            childOrdering: neighbour.childOrdering.filter(id => id !== this.nodeId),
          },
        })
        this.$router.push({
          name: names.APP,
          params: { nodeId: neighbour.id },
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
