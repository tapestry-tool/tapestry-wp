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
import moment from "moment-timezone"
import { getCurrentUser } from "@/services/wp"

export default {
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
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
        this.node.reviewStatus = "reject"
        this.handleSubmit()
      }
    },
    handleAccept() {
      this.node.status = "publish"
      this.node.reviewStatus = "accept"
      this.handleSubmit()
    },
    handleSubmit() {
      const { name, email } = getCurrentUser()
      if (this.comment.length > 0) {
        this.node.reviewComments.push({
          timestamp: moment().toISOString(),
          comment: this.comment,
          author_name: name,
          author_email: email,
        })
      }
      this.$emit("submit")
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
