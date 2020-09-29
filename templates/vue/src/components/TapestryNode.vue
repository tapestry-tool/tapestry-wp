<template>
  <transition name="fade">
    <g
      v-show="show"
      ref="node"
      :class="{ opaque: !visibleNodes.includes(node.id) }"
      :style="{
        cursor: node.accessible || hasPermission('edit') ? 'pointer' : 'not-allowed',
      }"
      @click="handleClick"
      @mouseover="handleMouseover"
      @mouseleave="$emit('mouseleave')"
    >
      <circle
        ref="circle"
        :cx="node.coordinates.x"
        :cy="node.coordinates.y"
        :fill="fill"
      ></circle>
      <circle
        v-if="selected || !node.accessible"
        :cx="node.coordinates.x"
        :cy="node.coordinates.y"
        :r="radius"
        :fill="overlayFill"
        class="node-overlay"
      ></circle>
      <progress-bar
        v-show="
          node.nodeType !== 'grandchild' &&
            node.nodeType !== '' &&
            !node.hideProgress
        "
        :x="node.coordinates.x"
        :y="node.coordinates.y"
        :radius="radius"
        :progress="progress"
        :locked="!node.accessible"
      ></progress-bar>
      <g v-show="node.nodeType !== 'grandchild' && node.nodeType !== ''">
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
        <g v-show="!transitioning">
          <foreignObject
            v-if="!node.hideMedia"
            class="node-button-wrapper"
            :x="node.coordinates.x - 30"
            :y="node.coordinates.y - radius - 30"
          >
            <button
              class="node-button"
              :disabled="!node.accessible && !hasPermission('edit')"
              @click.stop="handleRequestOpen"
            >
              <tapestry-icon
                v-if="node.mediaType !== 'text'"
                :icon="icon"
              ></tapestry-icon>
              <span v-else>Aa</span>
            </button>
          </foreignObject>
          <add-child-button
            v-if="hasPermission('add') && !isSubAccordionRow"
            :node="node"
            :x="node.coordinates.x - 65"
            :y="node.coordinates.y + radius - 30"
          ></add-child-button>
          <foreignObject
            v-if="hasPermission('edit')"
            class="node-button-wrapper"
            :x="node.coordinates.x + 5"
            :y="node.coordinates.y + radius - 30"
          >
            <button class="node-button" @click.stop="editNode">
              <tapestry-icon icon="pen"></tapestry-icon>
            </button>
          </foreignObject>
        </g>
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
  </transition>
</template>

<script>
import * as d3 from "d3"
import { mapActions, mapGetters, mapState, mapMutations } from "vuex"
import TapestryIcon from "@/components/TapestryIcon"
import { names } from "@/config/routes"
import { bus } from "@/utils/event-bus"
import Helpers from "@/utils/Helpers"
import AddChildButton from "./tapestry-node/AddChildButton"
import ProgressBar from "./tapestry-node/ProgressBar"
import DragSelectModular from "@/utils/dragSelectModular"

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
  data() {
    return {
      transitioning: false,
    }
  },
  computed: {
    ...mapState(["selection", "settings", "visibleNodes"]),
    ...mapGetters([
      "getNode",
      "getDirectChildren",
      "isVisible",
      "getParent",
      "isAccordionRow",
    ]),
    isSubAccordionRow() {
      const parent = this.getParent(this.node.id)
      if (parent) {
        return this.isAccordionRow(parent)
      }
      return false
    },
    icon() {
      if (!this.node.accessible) {
        return "lock"
      }
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
    show() {
      return this.isVisible(this.node.id)
    },
    radius() {
      if (!this.show) {
        return 0
      }
      if (this.root) {
        return 210
      }
      if (this.node.nodeType === "grandchild") {
        return 40
      }
      return 140
    },
    fill() {
      const showImages = this.settings.hasOwnProperty("renderImages")
        ? this.settings.renderImages
        : true
      if (this.node.imageURL && this.node.nodeType !== "grandchild" && showImages) {
        return `url(#node-image-${this.node.id})`
      }
      return "#8396a1"
    },
    overlayFill() {
      if (this.selected) {
        return "#11a6d8"
      } else if (!this.node.accessible) {
        return "#8a8a8c"
      }
      return "transparent"
    },
    selected() {
      return this.selection.includes(this.node.id)
    },
    progress() {
      if (this.node.mediaType !== "accordion") {
        return this.node.progress
      }
      const rows = this.getDirectChildren(this.node.id)
      return rows.map(this.getNode).filter(row => row.completed).length / rows.length
    },
  },
  watch: {
    radius(newRadius) {
      d3.select(this.$refs.circle)
        .transition()
        .duration(800)
        .ease(d3.easePolyOut)
        .on("start", () => {
          this.transitioning = true
        })
        .on("end", () => {
          this.transitioning = false
        })
        .attr("r", newRadius)
    },
  },
  mounted() {
    DragSelectModular.updateSelectableNodes()
    this.$refs.circle.setAttribute("r", this.radius)
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
          if (this.hasPermission("edit")) {
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
          }
        })
    )
  },
  methods: {
    ...mapActions(["updateNodeCoordinates"]),
    ...mapMutations(["select", "unselect", "updateSelectedNode"]),
    updateRootNode() {
      this.$router.push({
        name: names.APP,
        params: { nodeId: this.node.id },
        query: this.$route.query,
      })
      this.updateSelectedNode(this.node.id)
    },
    openNode() {
      this.$router.push({
        name: names.LIGHTBOX,
        params: { nodeId: this.node.id },
        query: this.$route.query,
      })
    },
    editNode() {
      this.$router.push({
        name: names.MODAL,
        params: { nodeId: this.node.id, type: "edit", tab: "content" },
        query: this.$route.query,
      })
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
    handleRequestOpen() {
      if (this.node.accessible || this.hasPermission("edit")) {
        this.openNode()
      }
    },
    handleMouseover() {
      // Move node to end of svg document so it appears on top
      const node = this.$refs.node
      node.parentNode.appendChild(node)

      bus.$emit("mouseover", this.node.id)
      this.$emit("mouseover")
    },
    handleClick(evt) {
      if (evt.ctrlKey || evt.metaKey || evt.shiftKey) {
        this.selected ? this.unselect(this.node.id) : this.select(this.node.id)
      } else if (this.node.accessible || this.hasPermission("edit")) {
        this.root && this.node.hideMedia ? this.openNode() : this.updateRootNode()
      }
    },
    hasPermission(action) {
      return Helpers.hasPermission(this.node, action)
    },
  },
}
</script>

<style lang="scss" scoped>
.opaque {
  opacity: 0.2;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
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

  > .fas.fa-play {
    left: 55%;
  }

  span {
    font-size: 28px;
    font-weight: bolder;
  }

  &-wrapper {
    width: 65px;
    height: 65px;
  }
}

.node-overlay {
  opacity: 0.75;
}
</style>
