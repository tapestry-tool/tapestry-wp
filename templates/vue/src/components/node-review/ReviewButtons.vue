<template>
  <div class="review-buttons">
    <b-button size="sm" variant="danger" @click="handleReject">
      Reject
    </b-button>
    <b-button size="sm" variant="success" @click="handleAccept">
      Accept and Add
    </b-button>
  </div>
</template>

<script>
import * as Comment from "@/utils/comments"
import { nodeStatus } from "@/utils/constants"

export default {
  methods: {
    handleReject() {
      const updates = {}
      updates.reviewStatus = nodeStatus.REJECT
      updates.reviewComments = [
        Comment.createComment(Comment.types.STATUS_CHANGE, {
          from: nodeStatus.SUBMIT,
          to: nodeStatus.REJECT,
        }),
      ]
      this.$emit("reject", updates)
    },
    handleAccept() {
      const updates = {}
      updates.status = nodeStatus.PUBLISH
      updates.reviewStatus = nodeStatus.ACCEPT
      updates.reviewComments = [
        Comment.createComment(Comment.types.STATUS_CHANGE, {
          from: nodeStatus.SUBMIT,
          to: nodeStatus.ACCEPT,
        }),
      ]
      this.$emit("accept", updates)
    },
  },
}
</script>

<style lang="scss" scoped>
.review-buttons {
  display: flex;

  button {
    display: block;
    flex: 1;

    &:first-child {
      margin-right: 0.25rem;
    }

    &:last-child {
      margin-left: 0.25rem;
    }
  }
}
</style>
