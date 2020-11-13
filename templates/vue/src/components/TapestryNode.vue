<template>
  <transition name="fade">
    <g
      v-show="show"
      ref="node"
      :data-qa="`node-${node.id}`"
      :data-locked="!node.accessible"
      :transform="`translate(${node.coordinates.x}, ${node.coordinates.y})`"
      :class="{ opaque: !visibleNodes.includes(node.id) }"
      :style="{
        cursor: node.accessible || hasPermission('edit') ? 'pointer' : 'not-allowed',
      }"
      @click="handleClick"
      @mouseover="handleMouseover"
      @mouseleave="$emit('mouseleave')"
    >
      <circle ref="circle" :fill="fill"></circle>
      <circle
        v-if="selected || !node.accessible"
        :r="radius"
        :fill="overlayFill"
        class="node-overlay"
      ></circle>
      <progress-bar
        v-if="
          node.nodeType !== 'grandchild' &&
            node.nodeType !== '' &&
            !node.hideProgress
        "
        :x="node.coordinates.x"
        :y="node.coordinates.y"
        :radius="radius"
        :data-qa="`node-progress-${node.id}`"
        :progress="progress"
        :locked="!node.accessible"
      ></progress-bar>
      <status-bar
        v-if="
          node.nodeType !== 'grandchild' &&
            node.nodeType !== '' &&
            !node.hideProgress
        "
        :x="node.coordinates.x"
        :y="node.coordinates.y"
        :radius="radius"
        :locked="!node.accessible"
        :status="node.status"
        :reviewStatus="node.reviewStatus"
      ></status-bar>
      <g v-show="node.nodeType !== 'grandchild' && node.nodeType !== ''">
        <foreignObject
          v-if="!node.hideTitle"
          :data-qa="`node-title-${node.id}`"
          class="metaWrapper"
          :width="(140 * 2 * 5) / 6"
          :height="(140 * 2 * 5) / 6"
          :x="-(140 * 5) / 6"
          :y="-(140 * 5) / 6"
        >
          <div class="meta">
            <p class="title">{{ node.title }}</p>
            <p v-if="node.mediaDuration" class="timecode">
              {{ formatDuration() }}
            </p>
          </div>
        </foreignObject>
        <g v-show="!transitioning">
          <node-button
            v-if="!node.hideMedia"
            :x="0"
            :y="-radius"
            :data-qa="`open-node-${node.id}`"
            :disabled="!node.accessible && !hasPermission('edit')"
            @click="handleRequestOpen"
          >
            <tapestry-icon :icon="icon" svg></tapestry-icon>
          </node-button>
          <add-child-button
            v-if="isLoggedIn && !isSubAccordionRow"
            :node="node"
            :x="hasPermission('edit') ? -35 : 0"
            :y="radius"
          ></add-child-button>
          <node-button
            v-if="isLoggedIn && hasPermission('edit')"
            :x="isSubAccordionRow ? 0 : 35"
            :y="radius"
            :data-qa="`edit-node-${node.id}`"
            @click="editNode"
          >
            <tapestry-icon icon="pen" svg></tapestry-icon>
          </node-button>
        </g>
      </g>
      <defs>
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
import * as wp from "@/services/wp"
import AddChildButton from "./tapestry-node/AddChildButton"
import ProgressBar from "./tapestry-node/ProgressBar"
import StatusBar from "./tapestry-node/StatusBar"
import NodeButton from "./tapestry-node/NodeButton"

export default {
  name: "tapestry-node",
  components: {
    AddChildButton,
    ProgressBar,
    TapestryIcon,
    StatusBar,
    NodeButton,
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
    isLoggedIn() {
      return wp.isLoggedIn()
    },
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
      if (
        !this.node.imageURL &&
        this.node.lockedImageURL &&
        this.node.nodeType !== "grandchild" &&
        showImages &&
        this.node.accessible
      ) {
        return "#8396a1"
      }
      if (
        (this.node.imageURL || this.node.lockedImageURL) &&
        this.node.nodeType !== "grandchild" &&
        showImages
      ) {
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
        .map(this.getNode)
        .filter(n => n.status !== "draft")
      return rows.filter(row => row.completed).length / rows.length
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
    this.$emit("mounted")
    this.$refs.circle.setAttribute("r", this.radius)
    const nodeRef = this.$refs.node
    d3.select(nodeRef).call(
      d3
        .drag()
        .on("start", () => {
          this.coordinates = {}
          if (this.selection.length) {
            this.coordinates = this.selection.reduce((coordinates, nodeId) => {
              const node = this.getNode(nodeId)
              coordinates[nodeId] = {
                x: node.coordinates.x,
                y: node.coordinates.y,
              }
              return coordinates
            }, {})
          } else {
            this.coordinates[this.node.id] = {
              x: this.node.coordinates.x,
              y: this.node.coordinates.y,
            }
          }
        })
        .on("drag", () => {
          for (const id of Object.keys(this.coordinates)) {
            const node = this.getNode(id)
            node.coordinates.x += d3.event.dx
            node.coordinates.y += d3.event.dy
          }
        })
        .on("end", () => {
          for (const [id, originalCoordinates] of Object.entries(this.coordinates)) {
            const node = this.getNode(id)
            node.coordinates.x += d3.event.dx
            node.coordinates.y += d3.event.dy
            let coordinates = {
              x: node.coordinates.x,
              y: node.coordinates.y,
            }
            if (
              originalCoordinates.x == coordinates.x &&
              originalCoordinates.y == coordinates.y
            ) {
              continue
            }
            this.$emit("dragend")
            this.updateNodeCoordinates({
              id,
              coordinates,
              originalCoordinates,
            }).catch(() => {
              this.$emit("dragend")
            })
          }
        })
    )
  },
  methods: {
    ...mapActions(["updateNodeCoordinates"]),
    ...mapMutations(["select", "unselect", "updateSelectedNode"]),
    updateRootNode() {
      if (!this.root) {
        this.$router.push({
          name: names.APP,
          params: { nodeId: this.node.id },
          query: this.$route.query,
        })
        this.updateSelectedNode(this.node.id)
      }
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
