<template>
  <g>
    <circle
      v-show="isVisible"
      ref="node"
      :class="[
        'tapestry-node',
        {
          root: node.id == selectedNodeId,
          grandchild: node.nodeType === 'grandchild',
        },
      ]"
      :cx="node.fx"
      :cy="node.fy"
      :fill="
        node.imageURL && node.imageURL.length
          ? `url('#node-thumb-2059')`
          : `currentColor`
      "
      r="140"
      :transform="
        `matrix(${scale}, 0, 0, ${scale}, ${node.fx - scale * node.fx}, ${node.fy -
          scale * node.fy})`
      "
      @click="updateSelectedNode(node.id)"
    ></circle>
  </g>
</template>

<script>
import * as d3 from "d3"
import { mapState, mapMutations } from "vuex"

export default {
  name: "tapestry-node",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState(["selectedNodeId"]),
    isVisible() {
      return this.node.nodeType !== ""
    },
    scale() {
      if (this.node.id == this.selectedNodeId) {
        return 1.5
      }
      if (this.node.nodeType === "grandchild") {
        return 0.3
      }
      return 1
    },
  },
  mounted() {
    const nodeRef = this.$refs.node
    d3.select(nodeRef).call(
      d3.drag().on("drag", () => {
        this.node.fx += d3.event.dx
        this.node.fy += d3.event.dy
      })
    )
  },
  methods: {
    ...mapMutations(["updateSelectedNode"]),
  },
}
</script>

<style lang="scss" scoped>
.tapestry-node {
  transition: all 0.2s ease-out;
}
</style>
