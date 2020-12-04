<template>
  <section v-if="visible" data-name="review">
    <h2 class="content-header">Review</h2>
    <b-overlay class="loading" bg-color="#5d656c" :show="loading">
      <review-log :events="events" :aria-hidden="loading"></review-log>
      <div v-if="reviewable" class="comment-form" :aria-hidden="loading">
        <textarea
          v-model="comment"
          aria-label="comment"
          placeholder="Leave a comment..."
          @keydown.stop
        />
        <review-buttons
          v-if="canReview"
          class="review-buttons"
          :aria-hidden="loading"
          @accept="submitReview"
          @reject="handleReject"
        ></review-buttons>
        <b-button
          v-else
          class="submit-button"
          variant="info"
          :aria-hidden="loading"
          @click="submitReview({ reviewComments: [] })"
        >
          Submit
        </b-button>
      </div>
    </b-overlay>
  </section>
</template>

<script>
import { mapActions } from "vuex"

import { nodeStatus } from "@/utils/constants"
import * as Comment from "@/utils/comments"
import * as wp from "@/services/wp"

import ReviewLog from "./node-review/ReviewLog"
import ReviewButtons from "./node-review/ReviewButtons"

export default {
  components: {
    ReviewLog,
    ReviewButtons,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      comment: "",
      loading: false,
    }
  },
  computed: {
    events() {
      return this.node.reviewComments
    },
    visible() {
      if (!this.isReviewParticipant) {
        return false
      }
      return this.node.status === nodeStatus.DRAFT
        ? this.node.reviewStatus !== undefined
        : this.node.reviewStatus === nodeStatus.ACCEPT
    },
    reviewable() {
      return this.node.status === nodeStatus.DRAFT && this.node.reviewStatus
    },
    canReview() {
      return this.reviewable && wp.canEditTapestry()
    },
    isReviewParticipant() {
      const { id } = wp.getCurrentUser()
      return wp.canEditTapestry() || this.node.author.id == id
    },
  },
  methods: {
    ...mapActions(["updateNode"]),
    async handleReject(updates) {
      let confirm = true
      if (this.comment.length === 0) {
        confirm = await this.$bvModal.msgBoxConfirm(
          "Are you sure you want to reject this node without a comment?"
        )
      }
      if (confirm) {
        this.submitReview(updates)
      }
    },
    async submitReview(updates) {
      this.loading = true
      if (this.comment.length > 0) {
        updates.reviewComments.push(
          Comment.createComment(Comment.types.COMMENT, { comment: this.comment })
        )
      }
      await this.updateNode({
        id: this.node.id,
        newNode: {
          ...updates,
          reviewComments: this.node.reviewComments.concat(
            updates.reviewComments || []
          ),
        },
      })
      this.comment = ""
      this.loading = false
    },
  },
}
</script>

<style scoped>
textarea {
  display: block;
  border-radius: 0.25rem;
  width: 100%;
}

.comment-form {
  background: var(--gray);
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin: 0 -0.5rem;
}

.review-buttons {
  margin-top: 0.5rem;
}

.loading {
  margin: 0 -0.5rem;
  padding: 0 0.5rem;
}

.submit-button {
  display: block;
  width: 100%;
  margin-top: 0.5rem;
}
</style>
