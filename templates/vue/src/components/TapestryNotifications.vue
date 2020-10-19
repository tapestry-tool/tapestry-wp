<template>
  <div v-if="canReview">
    <b-dropdown id="dropdown-1" :disabled="pending < 1" :text="text" class="m-md-2">
      <b-dropdown-item
        v-for="node in reviewNodes"
        :key="node.id"
        @click="goReview(node.id)"
      >
        {{ node.title }}
        <b-badge v-if="isNew(node)">New</b-badge>
      </b-dropdown-item>
    </b-dropdown>
    <div v-if="newReviewables > 0">New: {{ newReviewables }}</div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex"

export default {
  name: "tapestry-notifications",
  data() {
    return {}
  },
  computed: {
    ...mapState(["nodes"]),
    canReview() {
      return wpData.wpCanEditTapestry === "1"
    },
    text() {
      return "Nodes submitted: " + this.pending
    },
    reviewNodes() {
      let reviewNodes = Object.values(this.nodes).filter(
        node => node.status == "submitted"
      )
      return reviewNodes
    },
    pending() {
      return this.reviewNodes.length
    },
    newReviewables() {
      let newSinceLast = Object.values(this.nodes).filter(node => this.isNew(node))
      return newSinceLast.length
    },
  },
  methods: {
    ...mapActions(["updateNode"]),

    async goReview(id) {
      this.nodes[id].reviewed = true
      await this.setReviewStatus(this.nodes[id])
      this.$router.push(`/nodes/${id}`)
    },
    isNew(node) {
      return (
        node.status == "submitted" &&
        (!node.hasOwnProperty("reviewed") || !node.reviewed)
      )
    },
    async setReviewStatus(node) {
      await this.updateNode({
        id: node.id,
        newNode: node,
      })
    },
  },
}
</script>
