<template>
  <p>
    <span>{{ event.author.name }}</span>
    changed status from {{ event.from }} to {{ event.to }}.
    <span class="timestamp">{{ event.time }}</span>
  </p>
</template>

<script>
/**
 * A "StatusChange" event represents a change in node review status triggerred by
 * either a review or a submission for review. On top of the three base properties,
 * a StatusChange event adds two additional properties to the event object:
 *
 * - `from` the original status of the node
 * - `to` the new status of the node
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
p {
  font-size: 0.9rem;
}

span {
  font-weight: bold;
}

.timestamp {
  font-size: 0.8rem;
}
</style>
