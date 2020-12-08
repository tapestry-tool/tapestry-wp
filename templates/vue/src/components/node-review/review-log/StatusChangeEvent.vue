<template>
  <p>
    <span>{{ event.author.name }}</span>
    {{ text }}
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

import { nodeStatus } from "@/utils/constants"

export default {
  props: {
    event: {
      type: Object,
      required: true,
    },
  },
  computed: {
    text() {
      switch (this.event.to) {
        case nodeStatus.SUBMIT:
          return "submitted this node for review."
        case nodeStatus.REJECT:
          return "rejected this node."
        case nodeStatus.ACCEPT:
          return "accepted this node."
        default:
          return `changed status from ${this.event.from} to ${this.event.to}.`
      }
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
