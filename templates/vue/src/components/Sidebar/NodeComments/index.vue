<template>
  <b-overlay class="loading" bg-color="#5d656c" :show="loading">
    <div v-if="isLoggedIn" class="comment-form" :aria-hidden="loading">
      <p class="commenter-name">
        {{ username }}
      </p>
      <textarea
        v-model="comment"
        aria-label="comment"
        placeholder="Leave a comment..."
        @keydown.stop
      />
      <b-button
        class="submit-button"
        variant="info"
        :aria-hidden="loading"
        @click="submitComment"
      >
        Add comment
      </b-button>
    </div>
  </b-overlay>
</template>

<script>
import * as wp from "@/services/wp"

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
      loading: false,
    }
  },
  computed: {
    isLoggedIn() {
      return wp.isLoggedIn()
    },
    username() {
      return wp.getCurrentUser().name
    },
  },
  methods: {
    submitComment() {},
  },
}
</script>

<style lang="scss" scoped>
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
