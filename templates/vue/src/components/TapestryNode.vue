<template>
  <g
    v-show="isVisible"
    :class="{ opaque: !visibleNodes.includes(node.id) }"
    @click="updateSelectedNode(node.id)"
  >
    <circle
      ref="node"
      :cx="node.fx"
      :cy="node.fy"
      fill="currentColor"
      :r="radius"
    ></circle>
    <g v-if="node.id == selectedNodeId || node.nodeType !== 'grandchild'">
      <text :x="node.fx" :y="node.fy" fill="white" text-anchor="middle">
        {{ node.title }}
      </text>
      <foreignObject
        class="node-button"
        :x="node.fx - 30"
        :y="node.fy - radius - 30"
      >
        <button @click="openNode">Play</button>
      </foreignObject>
      <foreignObject
        class="node-button"
        :x="node.fx - 65"
        :y="node.fy + radius - 30"
      >
        <button @click="addNode">Add</button>
      </foreignObject>
      <foreignObject class="node-button" :x="node.fx + 5" :y="node.fy + radius - 30">
        <button @click="editNode">Edit</button>
      </foreignObject>
    </g>
  </g>
</template>

<script>
import * as d3 from "d3"
import { mapActions, mapState, mapMutations } from "vuex"

export default {
  name: "tapestry-node",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState(["selectedNodeId", "visibleNodes"]),
    isVisible() {
      return this.node.nodeType !== ""
    },
    radius() {
      if (this.node.id == this.selectedNodeId) {
        return 210
      }
      if (this.node.nodeType === "grandchild") {
        return 40
      }
      return 140
    },
  },
  mounted() {
    const nodeRef = this.$refs.node
    d3.select(nodeRef).call(
      d3
        .drag()
        .on("start", () => {
          this.originalFx = this.node.fx
          this.originalFy = this.node.fy
        })
        .on("drag", () => {
          this.node.fx += d3.event.dx
          this.node.fy += d3.event.dy
        })
        .on("end", () => {
          this.updateNodeCoordinates({
            id: this.node.id,
            coordinates: {
              x: this.node.fx,
              y: this.node.fy,
            },
          }).catch(() => {
            alert("Failed to save coordinates.")
            this.node.fx = this.originalFx
            this.node.fy = this.originalFy
          })
        })
    )
  },
  methods: {
    ...mapActions(["updateNodeCoordinates"]),
    ...mapMutations(["updateSelectedNode"]),
    openNode() {
      this.$router.push(`/nodes/${this.node.id}`)
    },
    addNode() {
      this.$root.$emit("add-node", this.node.id)
    },
    editNode() {
      this.$root.$emit("edit-node", this.node.id)
    },
  },
}
</script>

<style lang="scss" scoped>
.node-button {
  height: 60px;
  width: 60px;
}

.opaque {
  opacity: 0.2;
}
</style>
