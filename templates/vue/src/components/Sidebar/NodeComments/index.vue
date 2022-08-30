<template>
  <b-overlay class="loading" bg-color="#5d656c" :show="loading">
    <ul class="comment-list">
      <li v-for="comment in comments" :key="comment.id">
        <node-comment
          :comment="comment"
          :show-actions="showActions"
          @action="handleCommentAction"
        ></node-comment>
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
      let lastComment = null
      return this.node.comments.map(comment => {
        const collapsed =
          lastComment &&
          comment.authorId === lastComment.authorId &&
          Math.abs(comment.timestamp - lastComment.timestamp) <= anHour &&
          comment.approved === lastComment.approved
        lastComment = comment
        return {
          ...comment,
          collapsed,
        }
      })
    },
    showActions() {
      return wp.canEditTapestry()
    },
    isLoggedIn() {
      return wp.isLoggedIn()
    },
    username() {
      return wp.getCurrentUser().name
    },
  },
  methods: {
    ...mapActions(["addComment", "performCommentAction"]),
    async submitComment() {
      this.loading = true
      const success = await this.addComment({
        nodeId: this.node.id,
        comment: this.comment,
      })
      if (success) {
        this.comment = ""
      }
      this.loading = false
    },
    async handleCommentAction(comment, action) {
      console.log(comment, action)
      this.loading = true
      await this.performCommentAction({
        nodeId: this.node.id,
        commentId: comment.id,
        action: action,
      })
      this.loading = false
    },
  },
}
</script>

<style lang="scss" scoped>
::v-deep {
  --light-gray: #dce4ea;
  --light-yellow: #f7e9ae;
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
