<template>
  <div :class="{ 'pull-up': event.hideAuthor }">
    <h3 v-if="!event.hideAuthor" class="title">
      {{ event.author.name }}
      <span class="timestamp" :title="event.timestamp">{{ event.time }}</span>
    </h3>
    <p class="comment">{{ event.comment }}</p>
  </div>
</template>

<script>
/**
 * A "Comment" event represents a comment left on the node. On top of the three base
 * properties, a comment adds one additional property to the event object:
 *
 * - `comment` a string representing the comment
 */
export default {
  props: {
    event: {
      type: Object,
      required: true,
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
}
</style>
