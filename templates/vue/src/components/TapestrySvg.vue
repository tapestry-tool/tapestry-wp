<template>
  <svg id="vue-svg">
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
  </svg>
</template>

<script>
import { mapState } from "vuex"
import TapestryNode from "./TapestryNode"
import TapestryLink from "./TapestryLink"

export default {
  name: "tapestry-svg",
  components: {
    TapestryNode,
    TapestryLink,
  },
  computed: {
    ...mapState(["nodes", "links"]),
  },
}
</script>
