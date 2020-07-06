<template>
  <svg id="vue-svg" :viewBox="viewBox">
    <g>
      <tapestry-link
        v-for="link in links"
        :key="`${link.source}-${link.target}`"
        :link="link"
      ></tapestry-link>
    </g>
    <g>
      <tapestry-node
        v-for="node in nodes"
        :key="node.id"
        :node="node"
        class="node"
        :data-id="node.id"
        @dragend="updateViewBox"
      ></tapestry-node>
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
  data() {
    return {
      viewBox: "2200 2700 1600 1100",
    }
  },
  computed: {
    ...mapState(["nodes", "links"]),
  },
  mounted() {
    this.updateViewBox()
  },
  methods: {
    updateViewBox() {
      const box = {
        minX: 2500,
        minY: 3000,
        width: 3500,
        height: 3500,
      }

      for (const node of this.nodes) {
        const { x, y } = node.coordinates
        if (x < box.minX) {
          box.minX = x
        }
        if (y < box.minY) {
          box.minY = y
        }
        if (x > box.width) {
          box.width = x
        }
        if (y > box.height) {
          box.height = y
        }
      }

      const { minX, minY, width, height } = box
      this.viewBox = `${minX - 300} ${minY - 300} ${width - minX + 600} ${height -
        minY +
        600}`
    },
  },
}
</script>
