<template>
  <div class="comment-container" :class="{ 'pull-up': comment.collapsed }">
    <h3 v-if="!comment.collapsed" class="title">
      {{ comment.author }}
      <span class="timestamp" :title="formatDate(comment.timestamp, false)">
        {{ formatDate(comment.timestamp) }}
      </span>
    </h3>
    <div
      class="comment"
      :title="`Posted on ${formatDate(comment.timestamp, false)}`"
    >
      <p>
        {{ comment.content }}
      </p>
      <div v-if="showActions">
        <b-dropdown
          size="sm"
          variant="link"
          no-caret
          toggle-class="comment-action-btn"
        >
          <template #button-content>
            <i class="fas fa-ellipsis-v"></i>
          </template>
          <b-dropdown-item-button variant="danger" @click="$emit('delete', comment)">
            Delete
          </b-dropdown-item-button>
        </b-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment"

export default {
  props: {
    comment: {
      type: Object,
      required: true,
    },
    showActions: {
      type: Boolean,
      required: true,
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
.pull-up {
  margin-top: -0.5rem;
}

.title {
  color: var(--light-gray);
  font-family: "Avenir", sans-serif;
  font-size: 1em;
  font-weight: bold;
  margin: 0;
  margin-bottom: 0.25rem;
}

.timestamp {
  font-size: 0.8rem;
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
}
</style>

<style lang="scss">
.comment-action-btn {
  &,
  &:focus,
  &:hover,
  &:active {
    color: #333;
    background: none;
  }
}

.comment-container .comment:not(:hover) .comment-action-btn {
  // display: none;
}
</style>
