<template>
  <p>
    <span class="commenter-name">{{ event.author.name }}</span>
    <span class="event-text" :style="'color:' + color">{{ text }}</span>
    <span class="timestamp" :title="event.timestamp">{{ event.time }}</span>
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
          return "submitted"
        case nodeStatus.REJECT:
          return "rejected"
        case nodeStatus.ACCEPT:
          return "accepted"
        default:
          return `changed status from ${this.event.from} to ${this.event.to}`
      }
    },
    color() {
      switch (this.event.to) {
        case nodeStatus.SUBMIT:
          return "#FFC107"
        case nodeStatus.ACCEPT:
          return "#5CE601"
        case nodeStatus.REJECT:
          return "#FF7171"
        default:
          return "var(--light-gray)"
      }
    },
  },
}
</script>

<style lang="scss" scoped>
p {
  color: var(--light-gray);
}

span {
  font-weight: bold;
}

.event-text {
  font-style: italic;
}

.timestamp {
  font-size: 0.8rem;
}
</style>
