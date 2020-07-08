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
      v-show="!isGrandchild && !node.hideProgress"
      :x="node.coordinates.x"
      :y="node.coordinates.y"
      :radius="radius"
      :progress="node.progress"
      :locked="!node.accessible"
    ></progress-bar>
    <g v-show="!isGrandchild">
      <text
        v-if="!node.hideTitle"
        :x="node.coordinates.x"
        :y="node.coordinates.y"
        fill="white"
        text-anchor="middle"
      >
        {{ node.title }}
      </text>
      <foreignObject
        v-if="!node.hideMedia"
        class="node-button-wrapper"
        :x="node.coordinates.x - 30"
        :y="node.coordinates.y - radius - 30"
      >
        <button class="node-button" @click="openNode">
          <tapestry-icon
            v-if="node.mediaType !== 'text'"
            :icon="icon"
          ></tapestry-icon>
          <span v-else>Aa</span>
        </button>
      </foreignObject>
      <add-child-button
        :node="node"
        :x="node.coordinates.x - 65"
        :y="node.coordinates.y + radius - 30"
      ></add-child-button>
      <foreignObject
        class="node-button-wrapper"
        :x="node.coordinates.x + 5"
        :y="node.coordinates.y + radius - 30"
      >
        <button class="node-button" @click="editNode">
          <tapestry-icon icon="pen"></tapestry-icon>
        </button>
      </foreignObject>
    </g>
    <defs v-if="node.imageURL">
      <pattern
        :id="`node-image-${node.id}`"
        preserve-aspect-ratio="xMidYMid slice"
        width="1"
        height="1"
      >
        <image
          :href="
            node.lockedImageURL && !node.accessible
              ? node.lockedImageURL
              : node.imageURL
          "
          x="0"
          y="0"
          :width="radius * 2"
          :height="radius * 2"
        />
      </pattern>
    </defs>
  </g>
</template>

<script>
import * as d3 from "d3"
import { mapActions, mapGetters, mapState, mapMutations } from "vuex"
import TapestryIcon from "@/components/TapestryIcon"
import { bus } from "@/utils/event-bus"
import AddChildButton from "./tapestry-node/AddChildButton"
import ProgressBar from "./tapestry-node/ProgressBar"

export default {
  name: "tapestry-node",
  components: {
    AddChildButton,
    ProgressBar,
    TapestryIcon,
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
    icon() {
      switch (this.node.mediaType) {
        case "h5p":
        case "video":
          return "play"
        case "text":
          return "text"
        case "activity":
        case "gravity-form":
          return "tasks"
        case "url-embed":
          return "window-maximize"
        case "accordion":
          return "bars"
        case "wp-post":
          return "post"
        default:
          return "exclamation"
      }
    },
    isGrandchild() {
      return (
        this.node.id != this.selectedNodeId && this.node.nodeType === "grandchild"
      )
    },
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
      if (this.node.imageURL && !this.isGrandchild) {
        return `url(#node-image-${this.node.id})`
      }
      if (this.selected) {
        return "#11a6d8"
      }
      if (!this.node.accessible) {
        return "#8a8a8c"
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
        this.node.id == this.selectedNodeId && this.node.hideMedia
          ? this.openNode()
          : this.updateSelectedNode(this.node.id)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.opaque {
  opacity: 0.2;
}
</style>

<style lang="scss">
.node-button {
  height: 55px;
  width: 55px;
  background: #666;
  border-radius: 50%;
  border: 3px solid white;
  color: white;
  font-size: 30px;
  position: relative;

  > * {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  span {
    font-size: 24px;
  }

  &-wrapper {
    width: 65px;
    height: 65px;
  }
}
</style>
