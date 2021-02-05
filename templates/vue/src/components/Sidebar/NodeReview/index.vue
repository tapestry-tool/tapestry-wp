<template>
  <b-overlay class="loading" bg-color="#5d656c" :show="loading">
    <review-log :events="events" :aria-hidden="loading"></review-log>
    <div v-if="isReviewFormVisible" class="comment-form" :aria-hidden="loading">
      <p class="commenter-name">{{ username }}</p>
      <textarea
        v-model="comment"
        aria-label="comment"
        placeholder="Leave a comment..."
        @keydown.stop
      />
      <review-buttons
        v-if="isReviewer"
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
        @click="handleAuthorSubmit"
      >
        {{ submitText }}
      </b-button>
    </div>
  </b-overlay>
</template>

<script>
import { mapActions } from "vuex"

import { nodeStatus } from "@/utils/constants"
import * as Comment from "@/utils/comments"
import * as wp from "@/services/wp"

import ReviewLog from "./ReviewLog"
import ReviewButtons from "./ReviewButtons"

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
    /**
     * Whether the review form is visible. For authors, the form is visible as long
     * as the node is in the review process. For reviewers, the form is only visible
     * if the node is submitted for review (i.e. it's not rejected).
     */
    isReviewFormVisible() {
      if (this.isReviewer) {
        return this.node.reviewStatus === nodeStatus.SUBMIT
      }
      return this.node.status === nodeStatus.DRAFT
    },
    /**
     * A reviewer is anyone who has edit access to the Tapestry.
     */
    isReviewer() {
      return wp.canEditTapestry()
    },
    username() {
      return wp.getCurrentUser().name
    },
    submitText() {
      if (this.node.reviewStatus === nodeStatus.REJECT) {
        return `Resubmit for review`
      }
      if (this.node.reviewStatus === nodeStatus.SUBMIT) {
        return `Add comment`
      }
      return `Submit for review`
    },
  },
  methods: {
    ...mapActions(["reviewNode"]),
    handleAuthorSubmit() {
      if (this.node.reviewStatus !== nodeStatus.SUBMIT) {
        return this.submitReview([
          Comment.createComment(Comment.types.STATUS_CHANGE, {
            from: null,
            to: nodeStatus.SUBMIT,
          }),
        ])
      }
      return this.submitReview()
    },
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
    async submitReview(comments) {
      if (!Array.isArray(comments)) {
        comments = []
      }

      this.loading = true
      if (this.comment.length > 0) {
        comments.push(
          Comment.createComment(Comment.types.COMMENT, { comment: this.comment })
        )
      }
      await this.reviewNode({
        id: this.node.id,
        comments,
      })
      this.comment = ""
      this.loading = false
    },
  },
}
</script>

<style lang="scss" scoped>
::v-deep {
  --light-gray: #dce4ea;
}

.commenter-name {
  color: var(--light-gray);
  font-weight: bold;
  margin: 0;
  margin-bottom: 0.25rem;
}

textarea {
  display: block;
  border-radius: 0.5rem;
  border-top-left-radius: 0;
  width: 100%;
}

.comment-form {
  padding: 0 0.5rem;
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

.disclaimer {
  margin: 0.5rem 0;
  text-align: center;
  line-height: 1.2;
}
</style>
