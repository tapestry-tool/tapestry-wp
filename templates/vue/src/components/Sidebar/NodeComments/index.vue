<template>
  <b-overlay class="loading" bg-color="#5d656c" :show="loading">
    <template v-if="isLoggedIn">
      <b-button
        v-if="!showAuthoring"
        class="submit-button"
        variant="secondary"
        :aria-hidden="loading"
        @click="showAuthoring = true"
      >
        Add comment
      </b-button>
      <div v-else class="comment-form" :aria-hidden="loading">
        <p class="commenter-name">
          {{ username }}
        </p>
        <div v-if="replyingTo" class="replying-to">
          <div>
            <strong>Replying to:</strong>
            {{ replyingTo.content }}
          </div>
          <div>
            <b-button link size="sm" @click="replyingTo = null">
              <i class="fas fa-times"></i>
            </b-button>
          </div>
        </div>
        <textarea
          ref="textarea"
          v-model="comment"
          data-qa="comment-textarea"
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
          Post {{ replyingTo ? "reply" : "comment" }}
        </b-button>
      </div>
    </template>
    <ul class="comment-list">
      <li
        v-for="comment in comments"
        :key="comment.id"
        :class="{ collapsed: comment.collapsed }"
      >
        <node-comment
          :comment="comment"
          :show-all-actions="showAllActions"
          :is-author="isAuthor(comment)"
          @set-reply="replyingTo = $event"
          @action="handleCommentAction"
        ></node-comment>
        <ul
          v-if="comment.children && comment.children.length > 0"
          class="replies-list"
        >
          <li
            v-for="child in comment.children"
            :key="child.id"
            :class="{ collapsed: comment.collapsed }"
          >
            <node-comment
              :comment="child"
              :show-all-actions="showAllActions"
              :is-author="isAuthor(child)"
              :replying-to="
                child.parent !== comment.id
                  ? parentAuthor(child.parent, comment.id)
                  : null
              "
              @set-reply="replyingTo = $event"
              @action="handleCommentAction"
            ></node-comment>
          </li>
        </ul>
      </li>
    </ul>
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
      replyingTo: null,
      loading: false,
      showAuthoring: false,
    }
  },
  computed: {
    comments() {
      const anHour = 1000 * 60 * 60
      let lastComment = null
      return this.node.comments.map(comment => {
        const collapsed =
          !!lastComment &&
          comment.authorId === lastComment.authorId &&
          comment.author === lastComment.author && // to separate anonymous comments with different author names (having authorId === 0)
          Math.abs(comment.timestamp - lastComment.timestamp) <= anHour &&
          comment.approved === lastComment.approved &&
          lastComment.children.length === 0
        lastComment = comment
        let lastChild = null
        return {
          ...comment,
          collapsed,
          children: comment.children
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(child => {
              const collapsed =
                !!lastChild &&
                child.authorId === lastChild.authorId &&
                child.author === lastChild.author &&
                Math.abs(child.timestamp - lastChild.timestamp) <= anHour &&
                child.approved === lastChild.approved &&
                child.parent === lastChild.parent
              lastChild = child
              return {
                ...child,
                collapsed,
              }
            }),
        }
      })
    },
    showAllActions() {
      return wp.canEditTapestry()
    },
    isLoggedIn() {
      return wp.isLoggedIn()
    },
    username() {
      return wp.getCurrentUser().name
    },
  },
  watch: {
    showAuthoring(val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.textarea?.focus()
        })
      }
    },
    replyingTo(val) {
      if (val) {
        this.showAuthoring = true
        this.$nextTick(() => {
          this.$nextTick(() => {
            // double $nextTick because Bootstrap focuses the dropdown toggle in the first $nextTick
            this.$refs.textarea?.focus()
          })
        })
      }
    },
  },
  methods: {
    ...mapActions(["addComment", "performCommentAction"]),
    isAuthor(comment) {
      return wp.isCurrentUser(comment.authorId)
    },
    parentAuthor(parentId, rootId) {
      if (parentId === rootId) {
        return this.node.comments.find(comment => comment.id === parentId).author
      }
      return this.node.comments
        .find(comment => comment.id === rootId)
        .children.find(comment => comment.id === parentId).author
    },
    async submitComment() {
      this.loading = true
      const success = await this.addComment({
        nodeId: this.node.id,
        comment: this.comment,
        replyingTo: this.replyingTo ? this.replyingTo.id : null,
      })
      if (success) {
        this.comment = ""
        this.replyingTo = null
        this.showAuthoring = false
      }
      this.loading = false
    },
    async handleCommentAction(comment, action) {
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

ul {
  line-height: 1.5;
  list-style: none;
  padding: 0;
  margin: 0;
}

.comment-list > li {
  margin-bottom: 0.75rem;

  &.collapsed {
    margin-top: -0.5rem;
  }
}

.replies-list {
  margin-top: 0.5rem;
  padding-left: 1rem;

  & > li {
    margin-bottom: 0.5rem;

    &.collapsed {
      margin-top: -0.25rem;
    }
  }
}

.commenter-name {
  color: var(--light-gray);
  font-weight: bold;
  margin: 0;
  margin-bottom: 0.25rem;
}

.replying-to {
  font-size: 0.8rem;
  margin: 0;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  border-left: 0.25rem solid var(--light-gray);
  padding-left: 0.5rem;
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
  margin-bottom: 0.5rem;
}
</style>
