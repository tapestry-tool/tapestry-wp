<template>
  <g
    v-show="isVisible"
    :class="{ opaque: !visibleNodes.includes(node.id) }"
    @click="updateSelectedNode(node.id)"
    @mouseover="handleMouseover"
  >
    <circle
      ref="node"
      :cx="node.coordinates.x"
      :cy="node.coordinates.y"
      fill="currentColor"
      :r="radius"
    ></circle>
    <g v-show="node.id == selectedNodeId || node.nodeType !== 'grandchild'">
      <text
        :x="node.coordinates.x"
        :y="node.coordinates.y"
        fill="white"
        text-anchor="middle"
      >
        {{ node.title }}
      </text>
      <foreignObject
        class="node-button"
        :x="node.coordinates.x - 30"
        :y="node.coordinates.y - radius - 30"
      >
        <button @click="openNode">Play</button>
      </foreignObject>
      <add-child-button
        :node="node"
        :x="node.coordinates.x - 65"
        :y="node.coordinates.y + radius - 30"
      ></add-child-button>
      <foreignObject
        class="node-button"
        :x="node.coordinates.x + 5"
        :y="node.coordinates.y + radius - 30"
      >
        <button @click="editNode">Edit</button>
      </foreignObject>
    </g>
  </g>
</template>

<script>
import * as d3 from "d3"
import { mapActions, mapState, mapMutations } from "vuex"
import { bus } from "@/utils/event-bus"
import AddChildButton from "./tapestry-node/AddChildButton"

export default {
  name: "tapestry-node",
  components: {
    AddChildButton,
  },
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
          this.originalFx = this.node.coordinates.x
          this.originalFy = this.node.coordinates.y
        })
        .on("drag", () => {
          this.node.coordinates.x += d3.event.dx
          this.node.coordinates.y += d3.event.dy
        })
        .on("end", () => {
          this.$emit("dragend")
          this.updateNodeCoordinates({
            id: this.node.id,
            coordinates: {
              x: this.node.coordinates.x,
              y: this.node.coordinates.y,
            },
          }).catch(() => {
            alert("Failed to save coordinates.")
            this.node.coordinates.x = this.originalFx
            this.node.coordinates.y = this.originalFy
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
    editNode() {
      this.$root.$emit("edit-node", this.node.id)
    },
    handleMouseover() {
      bus.$emit("mouseover", this.node.id)
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
