<template>
  <div>
    <textarea
      v-model="comment"
      aria-label="comment"
      placeholder="Leave a comment..."
      @keydown.stop
    />
    <div class="review-buttons">
      <b-button size="sm" variant="danger" @click="handleReject">
        Reject
      </b-button>
      <b-button size="sm" variant="success" @click="handleAccept">
        Accept and Add
      </b-button>
    </div>
  </div>
</template>

<script>
import * as Comment from "@/utils/comments"

export default {
  data() {
    return {
      comment: "",
    }
  },
  methods: {
    async handleReject() {
      let confirm = true
      if (this.comment.length === 0) {
        confirm = await this.$bvModal.msgBoxConfirm(
          "Are you sure you want to reject this node without a comment?"
        )
      }
      if (confirm) {
        const updates = {}
        updates.reviewStatus = "reject"
        updates.reviewComments = [
          Comment.createComment(Comment.types.STATUS_CHANGE, {
            from: "submit",
            to: "reject",
          }),
        ]
        this.handleSubmit(updates)
      }
    },
    handleAccept() {
      const updates = {}
      updates.status = "publish"
      updates.reviewStatus = "accept"
      updates.reviewComments = [
        Comment.createComment(Comment.types.STATUS_CHANGE, {
          from: "submit",
          to: "accept",
        }),
      ]
      this.handleSubmit(updates)
    },
    handleSubmit(updates) {
      if (this.comment.length > 0) {
        updates.reviewComments.push(
          Comment.createComment(Comment.types.COMMENT, { comment: this.comment })
        )
      }
      this.comment = ""
      this.$emit("submit", updates)
    },
  },
}
</script>

<style lang="scss" scoped>
textarea {
  display: block;
  border-radius: 0.25rem;
  width: 100%;
  margin-bottom: 0.5rem;
}

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
