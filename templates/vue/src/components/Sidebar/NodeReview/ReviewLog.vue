<template>
  <ul>
    <li v-for="(event, index) in eventWithComponents" :key="event.timestamp + index">
      <component :is="event.component" :event="event"></component>
    </li>
  </ul>
</template>

<script>
/**
 * The ReviewLog component displays a list of review events "Asana-style". It
 * receives an array of events as props, where each event has, at minimum, the
 * following three properties:
 *
 * - `timestamp` the time the event was created in ISO8601 format
 * - `author` an object representing the author of the event
 * - `type` the type of the event, which is currently either "Comment" or
 * "StatusChange"
 */

import moment from "moment"

import CommentEvent from "./review-log/CommentEvent"
import StatusChangeEvent from "./review-log/StatusChangeEvent"

import * as Comment from "@/utils/reviewComments"

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
        [Comment.types.COMMENT]: CommentEvent,
        [Comment.types.STATUS_CHANGE]: StatusChangeEvent,
      }
      let filteredEvents = []
      let currentUser = null
      let currentTime = null
      this.events.forEach(event => {
        const timeDiff = currentTime
          ? moment(event.timestamp).diff(moment(currentTime))
          : null
        const hoursDiff = currentTime ? moment.duration(timeDiff).asHours() : 1000
        event.hideAuthor =
          event.type === Comment.types.COMMENT &&
          event.author.id === currentUser &&
          hoursDiff <= 1
        filteredEvents.push(event)
        currentUser = event.author.id
        currentTime = event.timestamp
      })
      return filteredEvents.map(event => ({
        ...event,
        component: eventComponents[event.type],
        time: moment(event.timestamp).fromNow(),
        timestamp: moment(event.timestamp).format("MMMM DD, YYYY h:mm:ss a"),
      }))
    },
  },
}
</script>

<style lang="scss" scoped>
ul {
  line-height: 1.5;
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 0.75rem;
}
</style>
