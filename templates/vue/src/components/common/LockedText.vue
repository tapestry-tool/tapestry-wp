<template>
  <div class="locked-text">
    <div v-if="isLoggedIn || !hasCompletedCondition">
      This content will be unlocked:
      <br />
      <ul class="locked-content-list">
        <li v-if="Object.keys(conditionNode).length">
          When {{ conditionNode.title }} is completed.
          <br />
          <br />
          (If you recently completed that, it may take a few moments to load this
          content.)
        </li>
        <li v-else-if="isParentLocked">When {{ parent.title }} is unlocked.</li>
        <li v-for="(cond, index) in conditions" :key="index">
          <span v-if="cond.type === conditionTypes.NODE_COMPLETED">
            When {{ cond.node.title }} is completed.
            <br />
            <br />
            If you recently completed that, it may take a few moments to load this
            content.
          </span>
          <span v-if="cond.type === conditionTypes.DATE_PASSED">
            After {{ formatDate(cond) }}.
          </span>
          <span v-if="cond.type === conditionTypes.DATE_NOT_PASSED">
            Until {{ formatDate(cond) }}.
          </span>
        </li>
      </ul>
    </div>
    <p v-else>
      Please login to unlock this node.
    </p>
  </div>
</template>

<script>
import moment from "moment-timezone"
import { mapGetters } from "vuex"
import { conditionTypes } from "@/utils/constants"
import * as wp from "@/services/wp"

export default {
  props: {
    node: {
      type: Object,
      required: true,
    },
    conditionNode: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  computed: {
    ...mapGetters(["getDirectParents", "getNode"]),
    parent() {
      const parentId = this.getDirectParents(this.node.id)[0]
      return parentId && this.getNode(parentId)
    },
    conditions() {
      return this.node.conditions
        .filter(cond => !cond.fulfilled)
        .map(cond => {
          if (cond.nodeId) {
            cond.node = this.getNode(cond.nodeId)
          }
          return cond
        })
    },
    conditionTypes() {
      return conditionTypes
    },
    hasCompletedCondition() {
      return this.conditions.find(
        cond => cond.type === conditionTypes.NODE_COMPLETED
      )
    },
    isParentLocked() {
      return (
        (this.node.conditions.length === 0 ||
          this.node.conditions.every(cond => cond.fulfilled)) &&
        this.parent
      )
    },
    isLoggedIn() {
      return wp.isLoggedIn()
    },
  },
  methods: {
    formatDate({ date, time, timezone }) {
      const formatStr = `MMM D YYYY [at] h:mm a [(${timezone})]`
      if (!time) {
        return moment.tz(date, timezone).format(formatStr)
      }
      return moment.tz(`${date} ${time}`, timezone).format(formatStr)
    },
  },
}
</script>

<style scoped>
.locked-content-list {
  list-style-type: none;
}
</style>
