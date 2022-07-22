<template>
  <div>
    <b-button
      :disabled="disabled"
      size="sm"
      variant="danger"
      @click="handleRemoveNode"
    >
      Delete Node
    </b-button>
  </div>
</template>

<script>
import { mapActions } from "vuex"

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
    isMultiContentNodeChild: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    ...mapActions(["deleteNode", "getNodeHasDraftChildren"]),
    async handleRemoveNode() {
      this.$emit("setLoading", true)
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
      this.deleteNode(this.nodeId).then(() => {
        this.$emit("complete")
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
