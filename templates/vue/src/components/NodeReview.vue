<template>
  <section v-if="isReviewParticipant" data-name="review">
    <h2 class="content-header">Review</h2>
    <b-overlay class="loading" bg-color="#5d656c" :show="loading">
      <review-log :events="events"></review-log>
      <review-form class="comment-form" @submit="submitReview"></review-form>
    </b-overlay>
  </section>
</template>

<script>
import { mapActions } from "vuex"

import ReviewLog from "./node-review/ReviewLog"
import ReviewForm from "./node-review/ReviewForm"

export default {
  components: {
    ReviewLog,
    ReviewForm,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
    }
  },
  computed: {
    events() {
      return this.node.reviewComments
    },
    isReviewParticipant() {
      return true
    },
  },
  methods: {
    ...mapActions(["updateNode"]),
    async submitReview(updates) {
      this.loading = true
      await this.updateNode({
        id: this.node.id,
        newNode: {
          ...updates,
          reviewComments: this.node.reviewComments.concat(updates.reviewComments),
        },
      })
      this.loading = false
    },
  },
}
</script>

<style scoped>
.comment-form {
  background: var(--gray);
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin: 0 -0.5rem;
}

.loading {
  margin: 0 -0.5rem;
  padding: 0 0.5rem;
}
</style>
