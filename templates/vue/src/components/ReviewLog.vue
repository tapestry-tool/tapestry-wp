<template>
  <ul>
    <li v-for="event in eventWithComponents" :key="event.timestamp">
      <component :is="event.component" :event="event"></component>
    </li>
  </ul>
</template>

<script>
/**
 * The EventLog component displays a list of events "Asana-style". It receives an
 * array of events as props, where each event has, at minimum, the following
 * three properties:
 *
 * - `timestamp` the time the event was created in ISO8601 format
 * - `author` an object representing the author of the event
 * - `type` the type of the event, which is currently either "Comment" or
 * "StatusChange"
 */

import moment from "moment"

import CommentEvent from "./review-log/CommentEvent"
import StatusChangeEvent from "./review-log/StatusChangeEvent"

export default {
  components: {
    CommentEvent,
    StatusChangeEvent,
  },
  props: {
    events: {
      type: Array,
      required: true,
    },
  },
  computed: {
    eventWithComponents() {
      const eventComponents = {
        Comment: CommentEvent,
        StatusChange: StatusChangeEvent,
      }
      return this.events.map(event => ({
        ...event,
        component: eventComponents[event.type],
        time: moment(event.timestamp).fromNow(),
      }))
    },
  },
}
</script>

<style scoped>
ul {
  line-height: 1.5;
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 0.75rem;
}
</style>
