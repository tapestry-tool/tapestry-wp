<template>
  <g
    v-show="isVisible"
    ref="node"
    :class="{ opaque: !visibleNodes.includes(node.id) }"
    @click="handleClick"
    @mouseover="handleMouseover"
  >
    <rect
      v-if="node.imageURL && node.nodeType !== 'grandchild'"
      :x="node.coordinates.x - radius"
      :y="node.coordinates.y - radius"
      :fill="fill"
      :rx="radius"
      :width="radius * 2"
      :height="radius * 2"
      style="background-size: contain;"
    ></rect>
    <circle
      v-else
      :cx="node.coordinates.x"
      :cy="node.coordinates.y"
      :fill="fill"
      :r="radius"
    ></circle>
    <progress-bar
      v-show="node.nodeType !== 'grandchild' && !node.hideProgress"
      :x="node.coordinates.x"
      :y="node.coordinates.y"
      :radius="radius"
      :progress="node.progress"
      :locked="!node.accessible"
    ></progress-bar>
    <g v-show="node.nodeType !== 'grandchild'">
      <foreignObject
        v-if="!node.hideTitle"
        class="metaWrapper"
        :width="(140 * 2 * 5) / 6"
        :height="(140 * 2 * 5) / 6"
        :x="node.coordinates.x - (140 * 5) / 6"
        :y="node.coordinates.y - (140 * 5) / 6"
      >
        <div class="meta">
          <p class="title">{{ node.title }}</p>
          <p v-if="node.mediaDuration" class="timecode">{{ formatDuration() }}</p>
        </div>
      </foreignObject>
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
        <button class="node-button" @click.stop="editNode">
          <tapestry-icon icon="pen"></tapestry-icon>
        </button>
      </foreignObject>
    </g>
    <defs v-if="node.imageURL">
      <pattern :id="`node-image-${node.id}`" width="1" height="1">
        <image
          preserveAspectRatio="xMidYMid slice"
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
    root: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    ...mapState(["selection", "visibleNodes"]),
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
    isVisible() {
      return this.node.nodeType !== ""
    },
    radius() {
      if (this.root) {
        return 210
      }
      if (this.node.nodeType === "grandchild") {
        return 40
      }
      return 140
    },
    fill() {
      if (this.node.imageURL && this.node.nodeType !== "grandchild") {
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
    formatDuration() {
      const seconds = this.node.mediaDuration
      const hours = Math.floor(seconds / 3600)
      let minutes = Math.floor((seconds - hours * 3600) / 60)
      let sec = seconds - hours * 3600 - minutes * 60

      if (sec < 10) sec = "0" + sec

      if (hours > 0 && minutes < 10) minutes = "0" + minutes

      if (hours === 0) return minutes + ":" + sec

      return hours + ":" + minutes + ":" + sec
    },
    handleMouseover() {
      bus.$emit("mouseover", this.node.id)
    },
    handleClick(evt) {
      if (evt.ctrlKey || evt.metaKey || evt.shiftKey) {
        this.selected ? this.unselect(this.node.id) : this.select(this.node.id)
      } else {
        this.root && this.node.hideMedia
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
