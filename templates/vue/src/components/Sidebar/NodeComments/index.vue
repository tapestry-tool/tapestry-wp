<template>
  <b-overlay class="loading" bg-color="#5d656c" :show="loading">
    <ul class="comment-list">
      <li v-for="comment in comments" :key="comment.id">
        <node-comment :comment="comment"></node-comment>
      </li>
    </ul>
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
import { mapActions } from "vuex"
import NodeComment from "./NodeComment"

export default {
  components: {
    NodeComment,
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
    comments() {
      const anHour = 1000 * 60 * 60
      let lastAuthorId = null
      let lastTimestamp = 0
      return this.node.comments.map(comment => {
        const collapsed =
          comment.authorId === lastAuthorId &&
          Math.abs(comment.timestamp - lastTimestamp) <= anHour
        lastAuthorId = comment.authorId
        lastTimestamp = comment.timestamp
        return {
          ...comment,
          collapsed,
        }
      })
    },
    isLoggedIn() {
      return wp.isLoggedIn()
    },
    username() {
      return wp.getCurrentUser().name
    },
  },
  methods: {
    ...mapActions(["addCommentToNode"]),
    async submitComment() {
      this.loading = true
      const success = await this.addCommentToNode({
        id: this.node.id,
        comment: this.comment,
      })
      if (success) {
        this.comment = ""
      }
      this.loading = false
    },
  },
}
</script>

<style lang="scss" scoped>
::v-deep {
  --light-gray: #dce4ea;
}

.comment-list {
  line-height: 1.5;
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin-bottom: 0.75rem;
  }
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
