<template>
  <transition name="fade">
    <g
      v-show="show"
      :id="elementId"
      ref="node"
      class="node-container"
      :aria-label="ariaLabel"
      :data-qa="`node-${node.id}`"
      :data-locked="!node.unlocked"
      :transform="`translate(${coordinates.x}, ${coordinates.y})`"
      :class="{
        desaturated: !isFilterMatched,
        opaque: !isFilterMatched,
      }"
      :style="{
        cursor:
          node.unlocked || hasPermission('edit') || hasPermission('move')
            ? 'pointer'
            : 'not-allowed',
      }"
      @focus="handleFocus"
      @blur="handleBlur"
      @click="handleClick"
      @mousedown="handleMousedown"
      @mouseup="isMouseDown = false"
      @mouseover="handleMouseover"
      @mouseleave="handleMouseleave"
    >
      <circle
        ref="circle"
        class="node-circle"
        :data-qa="`node-circle-${node.id}`"
        :fill="fill"
        :stroke="progressBackgroundColor"
      ></circle>
      <transition name="fade">
        <circle
          v-show="root && !isGrandChild"
          ref="halo"
          fill="none"
          :stroke-width="selectHaloWidth"
          :stroke="selectHaloColor"
        ></circle>
      </transition>
      <transition name="fade">
        <circle
          v-show="(!node.hideTitle && !isHovered) || !node.unlocked || selected"
          :r="radius"
          :fill="overlayFill"
          class="node-overlay"
          :class="selected ? 'selected' : !node.unlocked ? 'locked' : 'normal'"
        ></circle>
      </transition>
      <progress-bar
        v-if="!isGrandChild && node.nodeType !== '' && !node.hideProgress"
        :x="coordinates.x"
        :y="coordinates.y"
        :radius="radius"
        :background-color="progressBackgroundColor"
        :data-qa="`node-progress-${node.id}`"
        :progress="progress"
        :locked="!node.unlocked"
      ></progress-bar>
      <status-bar
        v-if="!isGrandChild && node.nodeType !== '' && !node.hideProgress"
        :x="coordinates.x"
        :y="coordinates.y"
        :radius="root ? radius + selectHaloWidth : radius"
        :locked="!node.unlocked"
        :status="node.status"
        :reviewStatus="node.reviewStatus"
        :enableHighlight="highlightNode"
        :data-qa="`node-status-${node.id}`"
      ></status-bar>
      <g v-show="!isGrandChild && node.nodeType !== ''">
        <transition name="fade">
          <foreignObject
            v-if="!node.hideTitle"
            v-show="
              !isHovered ||
                !thumbnailURL ||
                selected ||
                !node.unlocked ||
                hasPermission('edit')
            "
            :data-qa="`node-title-${node.id}`"
            class="metaWrapper"
            :width="(radius * 2 * 5) / 6"
            :height="(radius * 2 * 5) / 6"
            :x="-(radius * 5) / 6"
            :y="-(radius * 5) / 6"
          >
            <div
              class="meta"
              :style="{
                color: !isFilterMatched
                  ? 'var(--text-color-tertiary)'
                  : node.textColor,
                fontSize: radius * 0.2 + 'px',
              }"
            >
              <i
                v-if="!node.unlocked && node.hideWhenLocked"
                class="fas fa-eye-slash"
              ></i>
              <p
                ref="title"
                class="node-title"
                :data-qa="`node-title-text-${node.id}`"
                :contenteditable="isEditingTitle ? 'true' : 'false'"
                :tabindex="isEditingTitle ? '0' : '-1'"
                @blur="handleTitleBlur"
                @keydown="handleTitleKeydown"
                v-text="node.title"
              ></p>
              <p style="font-size: 60%;">Level {{ node.level }}</p>
              <p v-if="node.mediaDuration" class="timecode">
                {{ formatDuration() }}
              </p>
            </div>
          </foreignObject>
        </transition>
        <g v-show="radius >= 80">
          <node-button
            v-if="!node.hideMedia"
            :x="0"
            :y="-radius"
            :fill="buttonBackgroundColor"
            :data-qa="`open-node-${node.id}`"
            :disabled="!node.unlocked && !hasPermission('edit')"
            @click="handleRequestOpen"
          >
            <tapestry-icon :icon="icon" svg></tapestry-icon>
          </node-button>
          <template v-if="isLoggedIn">
            <add-child-button
              v-if="canAddChild"
              :node="node"
              :fill="buttonBackgroundColor"
              :x="canReview || hasPermission('edit') ? -35 : 0"
              :y="radius"
            ></add-child-button>
            <node-button
              v-if="hasPermission('edit')"
              :x="hasTooManyLevels && node.mediaType !== 'multi-content' ? 0 : 35"
              :y="radius"
              :fill="buttonBackgroundColor"
              :data-qa="`edit-node-${node.id}`"
              @click="editNode(node.id)"
            >
              <tapestry-icon icon="pen" svg></tapestry-icon>
            </node-button>
            <node-button
              v-else-if="canReview"
              :x="hasTooManyLevels ? 0 : 35"
              :y="radius"
              :fill="buttonBackgroundColor"
              :data-qa="`review-node-${node.id}`"
              @click="reviewNode"
            >
              <tapestry-icon icon="comment-dots" svg></tapestry-icon>
            </node-button>
          </template>
        </g>
      </g>
      <defs>
        <pattern :id="`node-image-${node.id}`" width="1" height="1">
          <image
            data-qa="nodeImage"
            preserveAspectRatio="xMidYMid slice"
            :href="thumbnailURL"
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
import { mapGetters, mapState, mapMutations, mapActions } from "vuex"
import TapestryIcon from "@/components/common/TapestryIcon"
import { names } from "@/config/routes"
import { bus } from "@/utils/event-bus"
import Helpers from "@/utils/Helpers"
import * as wp from "@/services/wp"
import client from "@/services/TapestryAPI"
import { nodeStatus } from "@/utils/constants"
import AddChildButton from "./AddChildButton"
import ProgressBar from "./ProgressBar"
import StatusBar from "./StatusBar"
import NodeButton from "./NodeButton"
import TinyColor from "tinycolor2"

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
    scale: {
      type: Number,
      required: true,
    },
    isEditingTitle: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      transitioning: false,
      isHovered: false,
      isFocused: false,

      lastClickTime: 0,

      themedBackground: "#eee",
    }
  },
  computed: {
    ...mapState([
      "selection",
      "settings",
      "visibleNodes",
      "maxLevel",
      "currentDepth",
      "nodeNavigation",
      "theme",
    ]),
    ...mapGetters([
      "getNode",
      "getDirectChildren",
      "isVisible",
      "getParent",
      "getNodeNavId",
    ]),
    ariaLabel() {
      let label = `${this.node.title}. You are on a level ${this.node.level} node. `
      if (
        this.node.id ===
        this.nodeNavigation.stack[this.nodeNavigation.stack.length - 1]
      ) {
        const childrenCount = this.getDirectChildren(this.node.id).length
        if (childrenCount === 0) {
          label += `This node has no children. To view this node, press Enter. To go back up, press the Up Arrow Key. To go to its siblings, press the Left or Right Arrow Key. `
        } else {
          label += `This node has ${childrenCount} ${
            childrenCount === 1 ? "child" : "children"
          }. To view this node, press Enter. To go to its${
            childrenCount === 1 ? "" : " first"
          } child, press the Down Arrow Key. To go back up, press the Up Arrow Key. To go to its siblings, press the Left or Right Arrow Key. `
        }
      } else {
        label +=
          "You are not on the node navigation route. To view this node, press Enter. "
      }
      if (this.hasPermission("edit")) {
        label += "To edit this node, press E. "
      }
      label +=
        "To go to the sidebar for this node, press S. To exit the Main Tapestry view, press the Q Key or the Escape Key."
      return label
    },
    canAddChild() {
      return (
        (this.node.mediaType === "multi-content" || !this.hasTooManyLevels) &&
        (this.hasPermission("add") || this.settings.draftNodesEnabled)
      )
    },
    canReview() {
      if (!this.isLoggedIn) {
        return false
      }
      if (parseInt(this.node.author.id) === wp.getCurrentUser().id) {
        return this.node.status === nodeStatus.DRAFT
      }
      if (wp.canEditTapestry()) {
        return this.node.reviewStatus === nodeStatus.SUBMIT
      }
      return false
    },
    elementId() {
      return Helpers.getNodeElementId(this.node.id)
    },
    isLoggedIn() {
      return wp.isLoggedIn()
    },
    hasTooManyLevels() {
      const parent = this.getParent(this.node.id)
      const grandparent = this.getParent(parent)
      if (parent && grandparent) {
        const parentNode = this.getNode(parent)
        const gpNode = this.getNode(grandparent)
        return (
          parentNode.mediaType !== "multi-content" &&
          gpNode.mediaType === "multi-content"
        )
      }
      return false
    },
    icon() {
      if (!this.node.unlocked) {
        return "lock"
      }
      switch (this.node.mediaType) {
        case "h5p":
        case "video":
          return "play"
        case "text":
          return "text"
        case "activity":
          return "tasks"
        case "url-embed":
          return "window-maximize"
        case "multi-content":
          return "bars"
        case "wp-post":
          return "post"
        case "answer":
          return "answer"
        default:
          return "exclamation"
      }
    },
    show() {
      return this.isVisible(this.node.id) && this.visibility >= 0
    },
    visibility() {
      return Helpers.getNodeVisibility(
        this.node.level,
        this.scale,
        this.currentDepth
      )
    },
    coordinates() {
      return {
        x: this.node.coordinates.x * this.scale,
        y: this.node.coordinates.y * this.scale,
      }
    },
    isGrandChild() {
      // return this.node.nodeType === "grandchild"
      // make it grandchild when not visible too, to prevent buttons showing up while transitioning to hidden
      return this.visibility <= 0
    },
    radius() {
      if (!this.show) {
        return 0
      }
      const radius = Helpers.getNodeRadius(this.node.level, this.scale)
      return this.isGrandChild ? Math.min(40, radius) : radius
    },
    fill() {
      const showImages = this.settings.hasOwnProperty("renderImages")
        ? this.settings.renderImages
        : true

      const backgroundColor = Helpers.darkenColor(
        this.node.backgroundColor,
        this.node.level,
        this.maxLevel
      )

      if (!this.isGrandChild && showImages && this.thumbnailURL) {
        return `url(#node-image-${this.node.id})`
      } else if (!this.isFilterMatched) {
        return this.desaturatedBackgroundColor
      } else if (this.selected) {
        return "var(--highlight-color)"
      } else {
        return backgroundColor
      }
    },
    overlayFill() {
      if (this.selected) {
        return "var(--highlight-color)8a"
      } else if (!this.node.unlocked) {
        return "#8a8a8cb3"
      }
      return this.thumbnailURL ? "#33333366" : "transparent"
    },
    // NOTE: This function is currently not used, but we may want to use it in the future for accessibility
    /*
    textColorReadable() {
      let color = this.node.textColor
      let tries = 0
      while (!TinyColor.isReadable(this.node.backgroundColor, color, {level:"AA",size:"large"}) && tries++ < 2) {
        if (TinyColor(this.node.backgroundColor).isDark()) {
          color = TinyColor(color).lighten().toString()
        }
        else {
          color = TinyColor(color).darken().toString()
        }
      }
      return color
    },
    */
    progressBackgroundColor() {
      let color = TinyColor(this.node.backgroundColor)
        .darken()
        .toString()
      while (!TinyColor(color).isDark()) {
        color = TinyColor(color)
          .darken()
          .toString()
      }
      return color
    },
    buttonBackgroundColor() {
      return TinyColor(this.progressBackgroundColor)
        .darken()
        .desaturate()
        .toString()
    },
    desaturatedBackgroundColor() {
      const background = this.themedBackground
      const desaturated = Helpers.saturateColor(this.node.backgroundColor, 0.7)
      return Helpers.mixColor(background, desaturated, 0.7)
    },
    thumbnailURL() {
      return !this.node.unlocked && this.node.lockedImageURL
        ? this.node.lockedImageURL
        : this.node.imageURL
    },
    selected() {
      return this.selection.includes(this.node.id)
    },
    progress() {
      if (this.node.mediaType !== "multi-content") {
        return this.node.progress
      }
      const rows = this.getDirectChildren(this.node.id)
        .map(this.getNode)
        .filter(n => n.status !== "draft")

      if (rows.length === 0) return 0
      return rows.filter(row => row.completed).length / rows.length
    },
    highlightNode() {
      return (
        this.node.reviewStatus !== nodeStatus.ACCEPT ||
        this.settings.showAcceptedHighlight
      )
    },
    isFilterMatched() {
      return this.visibleNodes.includes(this.node.id)
    },
    selectHaloWidth() {
      return this.radius * 0.1
    },
    selectHaloColor() {
      return "#49cfff"
    },
  },
  watch: {
    radius(newRadius) {
      d3.select(this.$refs.circle)
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .on("start", () => {
          this.transitioning = true
        })
        .on("end", () => {
          this.transitioning = false
        })
        .attr("r", newRadius)

      d3.select(this.$refs.halo)
        .transition()
        .duration(350)
        .ease(d3.easePolyOut)
        .attr("r", newRadius + this.selectHaloWidth / 2)
    },
    isEditingTitle(isEditingTitle) {
      if (isEditingTitle) {
        this.$nextTick(() => {
          this.$refs.title.focus()

          // select all text in the title <p> element
          if (window.getSelection && document.createRange) {
            const range = document.createRange()
            range.selectNodeContents(this.$refs.title)
            const sel = window.getSelection()
            sel.removeAllRanges()
            sel.addRange(range)
          } else if (document.body.createTextRange) {
            const range = document.body.createTextRange()
            range.moveToElementText(this.$refs.title)
            range.select()
          }
        })
      } else {
        const newNodeTitle = this.$refs.title.innerText
        if (newNodeTitle.length === 0 || newNodeTitle === this.node.title) {
          return
        }
        this.updateNode({
          id: this.node.id,
          newNode: {
            title: newNodeTitle,
          },
        })
      }
    },
    theme() {
      this.getThemedBackground()
    },
  },
  mounted() {
    this.$emit("mounted")
    this.$refs.circle.setAttribute("r", this.radius)
    this.$refs.halo.setAttribute("r", this.radius + this.selectHaloWidth / 2)
    const nodeRef = this.$refs.node
    if (this.root) {
      nodeRef.setAttribute("tabindex", "0")
    }
    d3.select(nodeRef).call(
      d3
        .drag()
        .on("start", () => {
          this.$emit("dragstart", this.node)
        })
        .on("drag", () => {
          this.$emit("drag", {
            x: d3.event.x,
            y: d3.event.y,
            dx: d3.event.dx,
            dy: d3.event.dy,
          })
        })
        .on("end", () => {
          this.$emit("dragend", {
            dx: d3.event.dx,
            dy: d3.event.dy,
          })
        })
    )
  },
  methods: {
    ...mapActions(["resetNodeNavigation", "updateNode"]),
    ...mapMutations(["select", "unselect"]),
    updateRootNode() {
      if (!this.root) {
        this.$router.push({
          name: names.APP,
          params: { nodeId: this.node.id },
          query: this.$route.query,
          path: `/nodes/${this.node.id}`,
        })
      }
    },
    openNode(id) {
      this.$root.$emit("open-node", id)
      client.recordAnalyticsEvent("app", "open", "lightbox", id)
    },
    editNode(id) {
      this.$root.$emit("edit-node", id)
      client.recordAnalyticsEvent("user", "click", "edit-node-button", id)
    },
    reviewNode() {
      this.$router.push({
        name: names.APP,
        params: { nodeId: this.node.id },
        query: { ...this.$route.query, sidebar: "review" },
      })
      client.recordAnalyticsEvent(
        "user",
        "click",
        "review-node-button",
        this.node.id
      )
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
      if (this.node.unlocked || this.hasPermission("edit")) {
        this.openNode(this.node.id)
      }
      client.recordAnalyticsEvent("user", "click", "open-node-button", this.node.id)
    },
    handleMouseover() {
      this.isHovered = true

      // Move node to end of svg document so it appears on top, but do not do this when the node is in focus since it will blur the node
      if (!this.isFocused && !this.isEditingTitle) {
        const node = this.$refs.node
        node.parentNode.appendChild(node)
      }

      bus.$emit("mouseover", this.node.id)
      this.$emit("mouseover")
    },
    handleMouseleave() {
      this.isHovered = false
      this.$emit("mouseleave")
    },
    handleMousedown() {
      this.isMouseDown = true
    },
    handleClick(evt) {
      evt.stopPropagation()

      const clickTime = new Date().getTime()
      if (clickTime - this.lastClickTime < 300 && this.hasPermission("edit")) {
        this.$emit("node-editing-title", this.node.id)
        this.lastClickTime = 0
      } else {
        if (
          this.hasPermission("edit") &&
          (evt.ctrlKey || evt.metaKey || evt.shiftKey)
        ) {
          this.selected ? this.unselect(this.node.id) : this.select(this.node.id)
        } else if (this.node.unlocked || this.hasPermission("edit")) {
          const shouldOpenLightbox =
            this.root && this.node.hideMedia && !this.hasPermission("edit")
          const shouldOpenToolbar = !shouldOpenLightbox && this.hasPermission("edit")
          this.$emit("click", {
            node: this.node,
            shouldOpenToolbar,
          })
          if (shouldOpenLightbox) {
            this.openNode(this.node.id)
          } else {
            this.updateRootNode()
          }
        }
        client.recordAnalyticsEvent("user", "click", "node", this.node.id)
        this.lastClickTime = clickTime
      }
    },
    handleTitleBlur() {
      this.$emit("node-editing-title", null)
    },
    handleTitleKeydown(evt) {
      if (evt.code === "Enter" || evt.code === "Escape") {
        evt.preventDefault()
        this.$refs.title.blur()
      }
    },
    handleFocus() {
      this.isFocused = true
      this.$emit("focus")
      // TODO: technically the next 3 lines are not needed, since the only way a node will be focused is through the keyboard node navigation which is managed by TapestryMain; nodes other than the focused node is not focusable (tabindex="-1")
      if (this.getNodeNavId !== this.node.id) {
        this.resetNodeNavigation(this.node.id)
      }
    },
    handleBlur() {
      this.isFocused = false
    },
    hasPermission(action) {
      return Helpers.hasPermission(this.node, action, this.settings.showRejected)
    },
    getThemedBackground() {
      this.themedBackground = getComputedStyle(this.$refs.node).getPropertyValue(
        "--bg-color-primary"
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

<style lang="scss">
.desaturated {
  filter: saturate(25%);
}

.node-container.opaque > *:not(.node-circle) {
  opacity: 0.3;
}

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
  color: white;
  min-height: 100%;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  font-size: 30px;

  .node-title {
    padding-left: 0;
    margin-top: 12px;
    margin-bottom: 0;
    font-weight: bold;
  }
}
</style>
