<template>
  <div class="comment-container">
    <h3 v-if="!comment.collapsed" class="title">
      {{ comment.author }}
      <span :title="formatDate(comment.timestamp, false)">
        {{ formatDate(comment.timestamp) }}
      </span>
      <span v-if="replyingTo !== null">in reply to {{ replyingTo }}</span>
      <span v-if="!comment.approved" class="unapproved-text">
        (held for moderation)
      </span>
    </h3>
    <div
      class="comment"
      :class="{
        unapproved: !comment.approved,
      }"
      :title="`Posted on ${formatDate(comment.timestamp, false)}`"
    >
      <p>
        {{ comment.content }}
      </p>
      <template v-if="isLoggedIn">
        <div v-if="showAllActions || (isAuthor && comment.approved)">
          <b-dropdown
            size="sm"
            variant="link"
            no-caret
            toggle-class="comment-action-btn comment-action-dropdown"
            aria-label="Comment actions"
          >
            <template #button-content>
              <i class="fas fa-ellipsis-v"></i>
            </template>
            <b-dropdown-item-button @click="$emit('set-reply', comment)">
              Reply
            </b-dropdown-item-button>
            <template v-if="showAllActions">
              <b-dropdown-item-button
                v-if="comment.approved"
                class="unapprove-action"
                @click="$emit('action', comment, 'unapprove')"
              >
                Unapprove
              </b-dropdown-item-button>
              <b-dropdown-item-button
                v-else
                variant="success"
                @click="$emit('action', comment, 'approve')"
              >
                Approve
              </b-dropdown-item-button>
              <b-dropdown-item-button
                variant="danger"
                @click="$emit('action', comment, 'spam')"
              >
                Spam
              </b-dropdown-item-button>
            </template>
            <b-dropdown-item-button
              variant="danger"
              @click="$emit('action', comment, 'trash')"
            >
              Trash
            </b-dropdown-item-button>
          </b-dropdown>
        </div>
        <div v-else-if="isAuthor">
          <b-button
            size="sm"
            variant="link"
            class="comment-action-btn"
            aria-label="Remove this comment"
            title="Trash"
            @click="$emit('action', comment, 'trash')"
          >
            <i class="fas fa-trash" aria-hidden="true"></i>
          </b-button>
        </div>
        <div v-else>
          <b-button
            size="sm"
            variant="link"
            class="comment-action-btn"
            aria-label="Reply to this comment"
            title="Reply"
            @click="$emit('set-reply', comment)"
          >
            <i class="fas fa-reply" aria-hidden="true"></i>
          </b-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import * as wp from "@/services/wp"
import moment from "moment"

export default {
  props: {
    comment: {
      type: Object,
      required: true,
    },
    showAllActions: {
      type: Boolean,
      required: true,
    },
    isAuthor: {
      type: Boolean,
      required: true,
    },
    replyingTo: {
      type: String,
      default: null,
    },
  },
  computed: {
    isLoggedIn() {
      return wp.isLoggedIn()
    },
  },
  methods: {
    formatDate(timestamp, relative = true) {
      const time = moment(timestamp)
      return relative ? time.fromNow() : time.format("MMMM DD, YYYY h:mm:ss a")
    },
  },
}
</script>

<style lang="scss" scoped>
.title {
  color: var(--light-gray);
  font-family: "Avenir", sans-serif;
  font-size: 1em;
  font-weight: bold;
  margin: 0;
  margin-bottom: 0.25rem;

  span {
    font-size: 0.8rem;
  }
}

.unapproved-text {
  color: var(--light-yellow);
}

.comment {
  color: #333;
  background: var(--light-gray);
  margin: 0;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border-top-left-radius: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  &.unapproved {
    background: var(--light-yellow);
  }
}
</style>

<style lang="scss">
.comment-action-btn {
  padding: 0 !important;
  height: 1rem;
  margin-top: -7px;
  margin-right: 3px;

  &,
  &:focus,
  &:hover,
  &:active,
  i {
    color: #333;
    background: none;
  }
}

.comment-container:not(:hover) .comment-action-btn {
  visibility: hidden;
}

.comment-container .unapprove-action button {
  color: #996800;
}
</style>
