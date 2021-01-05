<template>
  <transition name="fade">
    <g
      v-show="show"
      ref="node"
      :data-qa="`node-${node.id}`"
      :data-locked="!node.accessible"
      :transform="`translate(${node.coordinates.x}, ${node.coordinates.y})`"
      :class="{
        opaque: !visibleNodes.includes(node.id),
        'has-thumbnail': node.thumbnailURL,
        'has-title': !node.hideTitle,
      }"
      :style="{
        cursor: node.accessible || hasPermission('edit') ? 'pointer' : 'not-allowed',
      }"
      @click="handleClick"
      @mouseover="handleMouseover"
      @mouseleave="handleMouseleave"
    >
      <circle ref="circle" :fill="fill"></circle>
      <transition name="fade">
        <circle
          v-show="(!node.hideTitle && !isHovered) || !node.accessible || selected"
          :r="radius"
          :fill="overlayFill"
          class="node-overlay"
          :class="selected ? 'selected' : !node.accessible ? 'locked' : 'normal'"
        ></circle>
      </transition>
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
        <transition name="fade">
          <foreignObject
            v-if="!node.hideTitle"
            v-show="!isHovered || !thumbnailURL || selected || !node.accessible"
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
        </transition>
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
            @click="editNode(node.id)"
          >
            <tapestry-icon icon="pen" svg></tapestry-icon>
          </node-button>
        </g>
      </g>
      <defs v-if="imageUrl && imageUrl.length > 0">
        <pattern :id="`node-image-${node.id}`" width="1" height="1">
          <image
            preserveAspectRatio="xMidYMid slice"
            :href="thumbnailURL"
            x="0"
            y="0"
            :width="radius * 2"
            :height="radius * 2"
          />
        </pattern>
      </defs>
      <foreignObject
        v-if="showProgress && isModule"
        class="tyde-module-progress"
        :width="radius * 1.3"
        :height="radius / 7"
        :x="showPlanet ? -radius * 0.8 : -((radius * 1.3) / 2)"
        :y="-radius - 50"
      >
        <div class="progress">
          <div class="progress-bar" :style="{ width: `${progress * 100}%` }"></div>
        </div>
      </foreignObject>
      <foreignObject
        v-if="showPlanet && isModule"
        class="tyde-module-planet-icon"
        :width="radius / 2"
        :height="radius / 2"
        :x="radius * 0.7"
        :y="-radius * 1.2 - 45"
      >
        <img :src="planetUrl" alt="Planet View Icon" />
      </foreignObject>
      <foreignObject
        v-if="isModule && progress >= 1"
        class="tyde-module-complete-check"
        :x="radius - 45"
        :y="radius - 45"
      >
        <i class="fas fa-check"></i>
      </foreignObject>
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
import { tydeTypes } from "@/utils/constants"
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
      isHovered: false,
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
      "getTydeProgress",
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
    isModule() {
      return this.node.tydeType === tydeTypes.MODULE
    },
    showPlanet() {
      if (this.planetUrl) {
        return this.planetUrl.length > 0
      }
      return false
    },
    planetUrl() {
      if (this.isModule) {
        return this.progress < 1
          ? this.node.typeData.planetViewNotEarnedIconUrl
          : this.node.typeData.planetViewEarnedIconUrl
      }
      return ""
    },
    showProgress() {
      return this.progress > 0 && this.progress < 1
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

      if (this.node.nodeType !== "grandchild") {
        if (showImages && this.thumbnailURL) {
          return `url(#node-image-${this.node.id})`
        } else if (!this.node.accessible) {
          return "#8a8a8c"
        } else {
          return "#8396a1"
        }
      } else if (this.selected) {
        return "#11a6d8"
      } else {
        return "#8396a1"
      }
    },
    overlayFill() {
      if (this.selected) {
        return "#11a6d88a"
      } else if (!this.node.accessible) {
        return "#8a8a8cb3"
      }
      return this.thumbnailURL ? "#33333366" : "transparent"
    },
    thumbnailURL() {
      return !this.node.accessible && this.node.lockedImageURL
        ? this.node.lockedImageURL
        : this.node.imageURL
    },
    selected() {
      return this.selection.includes(this.node.id)
    },
    progress() {
      if (this.isModule || this.node.tydeType === tydeTypes.STAGE) {
        return this.getTydeProgress(this.node.id)
      }
      if (this.node.mediaType === "accordion") {
        const rows = this.getDirectChildren(this.node.id)
        return (
          rows.map(this.getNode).filter(row => row.completed).length / rows.length
        )
      }
      return this.node.progress
    },
    imageUrl() {
      const node = this.node
      return node.lockedImageURL && !node.accessible
        ? node.lockedImageURL
        : node.imageURL
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
    if (this.hasPermission("edit")) {
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
            for (const [id, originalCoordinates] of Object.entries(
              this.coordinates
            )) {
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
    }
  },
  methods: {
    ...mapActions(["updateNodeCoordinates"]),
    ...mapMutations([
      "select",
      "unselect",
      "updateSelectedNode",
      "updateSelectedModule",
    ]),
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
    openNode(id) {
      this.$root.$emit("open-node", id)
    },
    editNode(id) {
      this.$root.$emit("edit-node", id)
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
        this.isModule
          ? this.updateSelectedModule(this.node.id)
          : this.openNode(this.node.id)
      }
    },
    handleMouseover() {
      this.isHovered = true

      // Move node to end of svg document so it appears on top
      const node = this.$refs.node
      node.parentNode.appendChild(node)

      bus.$emit("mouseover", this.node.id)
      this.$emit("mouseover")
    },
    handleMouseleave() {
      this.isHovered = false
      this.$emit("mouseleave")
    },
    handleClick(evt) {
      if (
        this.hasPermission("edit") &&
        (evt.ctrlKey || evt.metaKey || evt.shiftKey)
      ) {
        this.selected ? this.unselect(this.node.id) : this.select(this.node.id)
      } else if (this.node.accessible || this.hasPermission("edit")) {
        this.root && this.node.hideMedia
          ? this.handleRequestOpen()
          : this.updateRootNode()
      }
    },
    hasPermission(action) {
      return Helpers.hasPermission(this.node, action, this.settings.showRejected)
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

.meta {
  .title {
    text-shadow: 0 0 5px #000;
    font-weight: bold;
  }
}
</style>
