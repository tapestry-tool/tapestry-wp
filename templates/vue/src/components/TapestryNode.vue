<template>
  <g>
    <circle
      ref="node"
      :cx="autoLayout ? node.x : node.fx"
      :cy="autoLayout ? node.y : node.fy"
      :fill="
        node.imageURL && node.imageURL.length
          ? `url('#node-thumb-2059')`
          : `currentColor`
      "
      r="140"
    ></circle>
  </g>
</template>

<script>
import * as d3 from "d3"

export default {
  name: "tapestry-node",
  props: {
    autoLayout: {
      type: Boolean,
      required: true,
    },
    node: {
      type: Object,
      required: true,
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
}
</script>

<style lang="scss" scoped></style>
