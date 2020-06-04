<template>
  <component :is="svg" id="vue-svg">
    <g>
      <tapestry-node
        v-for="node in nodes"
        :key="node.id"
        :node="node"
      ></tapestry-node>
    </g>
    <g>
      <tapestry-link
        v-for="link in links"
        :key="`${link.source.id}-${link.target.id}`"
        :link="link"
      ></tapestry-link>
    </g>
  </component>
</template>

<script>
import { mapState } from "vuex"
import SimulationController from "./SimulationController"
import TapestryNode from "./TapestryNode"
import TapestryLink from "./TapestryLink"

export default {
  name: "tapestry-svg",
  components: {
    SimulationController,
    TapestryNode,
    TapestryLink,
  },
  computed: {
    ...mapState(["nodes", "links", "settings"]),
    svg() {
      return this.settings.autolayout ? "simulation-controller" : "svg"
    },
  },
}
</script>
