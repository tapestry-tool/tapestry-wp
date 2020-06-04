<template>
  <svg ref="svg">
    <slot></slot>
  </svg>
</template>

<script>
import { mapState } from "vuex"
import * as d3 from "d3"

export default {
  data() {
    return {
      simulation: null,
    }
  },
  computed: {
    ...mapState(["nodes", "links", "rootId"]),
  },
  mounted() {
    const simulation = this.startSimulation()
    this.simulation = simulation
  },
  methods: {
    startSimulation() {
      const MAX_RADIUS = 240
      this.nodes.forEach(node => {
        delete node.fx
        delete node.fy
      })
      const dimensions = thisTapestryTool.getTapestryDimensions()

      d3.select(this.$refs.svg).attr(
        "viewBox",
        `0 0 ${dimensions.width} ${dimensions.height}`
      )

      const simulation = d3
        .forceSimulation(this.nodes)
        .force("charge", d3.forceManyBody().strength(-4000))
        .force("link", d3.forceLink(this.links))
        .velocityDecay(0.99)
        .force(
          "center",
          d3
            .forceCenter()
            .x(dimensions.width / 2)
            .y(dimensions.height / 2)
        )
        .force(
          "collision",
          d3
            .forceCollide()
            .radius(d => (d.id === this.rootId ? MAX_RADIUS : MAX_RADIUS - 25))
        )
      simulation.on("tick", this.updateSvg)
      return simulation
    },
    updateSvg() {
      const nodes = d3
        .select(this.$refs.svg)
        .selectAll("circle")
        .data(this.nodes)
      const links = d3
        .select(this.$refs.svg)
        .selectAll("line")
        .data(this.links)
      nodes.attr("cx", d => d.x).attr("cy", d => d.y)
      links
        .attr("x1", d => d.source.x)
        .attr("x2", d => d.target.x)
        .attr("y1", d => d.source.y)
        .attr("y2", d => d.target.y)
    },
  },
}
</script>
