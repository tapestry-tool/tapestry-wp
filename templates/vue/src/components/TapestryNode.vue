<template>
  <g
    v-show="isVisible"
    :class="{ opaque: !visibleNodes.includes(node.id) }"
    @click="handleClick"
    @mouseover="handleMouseover"
  >
    <circle
      ref="node"
      :cx="node.coordinates.x"
      :cy="node.coordinates.y"
      :fill="fill"
      :r="radius"
    ></circle>
    <progress-bar
      :x="node.coordinates.x"
      :y="node.coordinates.y"
      :radius="radius"
      :progress="node.typeData.progress[0]"
      :locked="!node.accessible"
    ></progress-bar>
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
import { mapActions, mapGetters, mapState, mapMutations } from "vuex"
import { bus } from "@/utils/event-bus"
import AddChildButton from "./tapestry-node/AddChildButton"
import ProgressBar from "./tapestry-node/ProgressBar"

export default {
  name: "tapestry-node",
  components: {
    AddChildButton,
    ProgressBar,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState(["selectedNodeId", "selection", "visibleNodes"]),
    ...mapGetters(["getNode"]),
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
    fill() {
      if (this.selected) {
        return "#11a6d8"
      }
      return "#8396a1"
    },
    selected() {
      return this.selection.includes(this.node.id)
    },
  },
  mounted() {
    const nodeRef = this.$refs.node
    d3.select(nodeRef).call(
      d3
        .drag()
        .on("start", () => {
          if (this.selection.length) {
            this.coordinates = this.selection.reduce((coordinates, nodeId) => {
              const node = this.getNode(nodeId)
              coordinates[nodeId] = { x: node.coordinates.x, y: node.coordinates.y }
              return coordinates
            }, {})
          } else {
            this.originalX = this.node.coordinates.x
            this.originalY = this.node.coordinates.y
          }
        })
        .on("drag", () => {
          if (this.selection.length) {
            this.selection.forEach(id => {
              const node = this.getNode(id)
              node.coordinates.x += d3.event.dx
              node.coordinates.y += d3.event.dy
            })
          } else {
            this.node.coordinates.x += d3.event.dx
            this.node.coordinates.y += d3.event.dy
          }
        })
        .on("end", () => {
          this.$emit("dragend")
          if (this.selection.length) {
            this.selection.forEach(id => {
              const node = this.getNode(id)
              this.updateNodeCoordinates({
                id: node.id,
                coordinates: {
                  x: node.coordinates.x,
                  y: node.coordinates.y,
                },
              }).catch(() => {
                alert("Failed to save coordinates.")
                node.coordinates.x = this.coordinates[id].x
                node.coordinates.y = this.coordinates[id].y
              })
            })
          } else {
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
          }
        })
    )
  },
  methods: {
    ...mapActions(["updateNodeCoordinates"]),
    ...mapMutations(["select", "unselect", "updateSelectedNode"]),
    openNode() {
      this.$router.push(`/nodes/${this.node.id}`)
    },
    editNode() {
      this.$root.$emit("edit-node", this.node.id)
    },
    handleMouseover() {
      bus.$emit("mouseover", this.node.id)
    },
    handleClick(evt) {
      if (evt.ctrlKey || evt.metaKey || evt.shiftKey) {
        this.selected ? this.unselect(this.node.id) : this.select(this.node.id)
      } else {
        this.updateSelectedNode(this.node.id)
      }
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
