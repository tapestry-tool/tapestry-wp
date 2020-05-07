<template>
  <div>
    <b-form-checkbox v-model="autoLayout" switch>
      Autolayout
    </b-form-checkbox>
    <svg id="vue-svg">
      <g>
        <tapestry-node
          v-for="node in nodes"
          :key="node.id"
          :auto-layout="autoLayout"
          :node="node"
        ></tapestry-node>
      </g>
      <g>
        <tapestry-link
          v-for="link in links"
          :key="`${link.source.id}-${link.target.id}`"
          :auto-layout="autoLayout"
          :link="link"
        ></tapestry-link>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3"
import { mapState } from "vuex"
import TapestryNode from "./TapestryNode"
import TapestryLink from "./TapestryLink"

export default {
  name: "tapestry-svg",
  components: {
    TapestryNode,
    TapestryLink,
  },
  data() {
    return {
      autoLayout: false,
      simulation: null,
    }
  },
  computed: {
    ...mapState(["nodes", "links", "rootId"]),
  },
  watch: {
    autoLayout(auto) {
      if (auto) {
        this.startSimulation()
      } else {
        this.simulation.stop()

        this.nodes.forEach(node => {
          node.fx = node.coordinates.x
          node.fy = node.coordinates.y
        })

        thisTapestryTool.updateSvgDimensions()
        this.simulation = null
      }
    },
  },
  methods: {
    startSimulation() {
      const MAX_RADIUS = 240
      this.nodes.forEach(node => {
        delete node.fx
        delete node.fy
      })
      const dimensions = thisTapestryTool.getTapestryDimensions()

      d3.select("#vue-svg").attr(
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
      this.simulation = simulation
    },
    updateSvg() {
      const nodes = d3
        .select("#vue-svg")
        .selectAll("circle")
        .data(this.nodes)
      const links = d3
        .select("#vue-svg")
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
