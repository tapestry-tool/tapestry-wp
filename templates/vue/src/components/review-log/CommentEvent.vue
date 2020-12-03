<template>
  <div>
    <h1 class="title">
      {{ event.author.name }}
      <span class="timestamp">{{ event.time }}</span>
    </h1>
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

<style scoped>
.title {
  font-family: "Avenir", sans-serif;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
  margin-bottom: 0.25rem;
}

.timestamp {
  font-size: 0.8rem;
}

.comment {
  background: var(--gray);
  margin: 0 -0.5rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
}
</style>
