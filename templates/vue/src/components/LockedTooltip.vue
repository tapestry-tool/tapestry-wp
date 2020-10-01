<template>
  <g :transform="`translate(${node.coordinates.x}, ${node.coordinates.y})`">
    <foreignObject :width="width" :height="height" :x="x" :y="y">
      <div class="tapestry-tooltip" :style="flexPosition">
        <div class="tapestry-tooltip-content">
          <span v-if="isLoggedIn || !hasCompleteCondition">
            This node will be unlocked:
            <br />
            <ul>
              <li v-if="isParentLocked">When {{ parent.title }} is unlocked.</li>
              <li v-for="(cond, index) in conditions" :key="index">
                <span v-if="cond.type === conditionTypes.NODE_COMPLETED">
                  When {{ cond.node.title }} is completed.
                </span>
                <span v-if="cond.type === conditionTypes.DATE_PASSED">
                  After {{ formatDate(cond) }}.
                </span>
                <span v-if="cond.type === conditionTypes.DATE_NOT_PASSED">
                  Until {{ formatDate(cond) }}.
                </span>
              </li>
            </ul>
          </span>
          <span v-else>
            Please login to unlock this node.
          </span>
        </div>
      </div>
    </foreignObject>
    <polygon class="tooltip-pointer" :points="points" fill="black"></polygon>
  </g>
</template>

<script>
import moment from "moment-timezone"
import { mapGetters } from "vuex"
import { conditionTypes } from "@/utils/constants"

export default {
  props: {
    node: {
      type: Object,
      required: true,
    },
    viewBox: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getDirectParents", "getNode"]),
    selectedNodeId() {
      return this.$route.params.nodeId
    },
    radius() {
      if (this.node.nodeType === "") {
        return 0
      }
      if (this.node.id === this.selectedNodeId) {
        return 210
      }
      if (this.node.nodeType === "grandchild") {
        return 40
      }
      return 140
    },
    height() {
      return this.radius * 2
    },
    width() {
      return Math.min(this.radius * 2 + 48, 400)
    },
    x() {
      return -this.width / 2
    },
    y() {
      return this.onBottom ? this.radius + 27.5 + 10 : -(this.radius * 3 + 27.5 + 20)
    },
    points() {
      const yOffset = this.onBottom
        ? this.y - this.height - 75
        : -this.y - this.height
      const points = this.onBottom
        ? [
            [-16, 16 - yOffset],
            [16, 16 - yOffset],
            [0, -16 - yOffset],
          ]
        : [
            [-16, -16 - yOffset],
            [16, -16 - yOffset],
            [0, 16 - yOffset],
          ]
      return points.map(point => point.join(",")).join(" ")
    },
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
    startY() {
      return this.viewBox.split(" ")[1]
    },
    onBottom() {
      return (
        this.node.coordinates.y - this.startY < this.height ||
        this.node.coordinates.y - this.startY - this.height <= window.scrollTop
      )
    },
    flexPosition() {
      return this.onBottom ? "align-items: flex-start;" : "align-items: flex-end;"
    },
    hasCompleteCondition() {
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
      return Boolean(wpData.wpUserId)
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
