<template></template>

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
 *
 * Comment
 * --
 * A "Comment" event represents a comment left on the node. On top of the three base
 * properties, a comment adds one additional property to the event object:
 *
 * - `comment` a string representing the comment
 *
 * StatusChange
 * --
 * A "StatusChange" event represents a change in node review status triggerred by
 * either a review or a submission for review. On top of the three base properties,
 * a StatusChange event adds two additional properties to the event object:
 *
 * - `from` the original status of the node
 * - `to` the new status of the node
 */

export default {
  props: {
    events: {
      type: Array,
      required: true,
    },
  },
}
</script>
