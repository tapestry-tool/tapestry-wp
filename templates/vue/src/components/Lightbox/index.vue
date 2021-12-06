<template>
  <tapestry-modal
    v-if="node"
    id="lightbox"
    data-qa="lightbox"
    :class="[
      'node-' + node.id,
      {
        'full-screen': node.fullscreen || settings.tydeModeEnabled,
        'content-text': node.mediaType === 'text' || node.mediaType === 'wp-post',
      },
    ]"
    :node="node"
    :content-container-style="lightboxContentStyles"
    :allow-close="canSkip && (!settings.tydeModeEnabled || canEditTapestry)"
    :show-fav="!settings.tydeModeEnabled"
    @close="handleUserClose"
  >
    <navbar v-if="settings.tydeModeEnabled"></navbar>
    <div
      v-show="selectedTab !== 'cos'"
      class="node-container"
      :class="{
        'multi-content': node.mediaType === 'multi-content',
        'video-content': node.mediaType === 'video' || node.mediaType === 'h5p',
      }"
    >
      <multi-content-media
        v-if="node.mediaType === 'multi-content'"
        id="multicontent-container"
        :node="node"
        :row-id="rowId"
        :class="{ 'has-navbar': settings.tydeModeEnabled }"
        @close="handleAutoClose"
        @complete="complete"
      />
      <page-menu
        v-if="node.typeData.showNavBar && node.presentationStyle === 'page'"
        :node="node"
        :dimensions="dimensions"
        :full-screen="settings.tydeModeEnabled"
      />
      <tapestry-media
        v-if="node.mediaType !== 'multi-content'"
        :node-id="nodeId"
        :dimensions="dimensions"
        context="lightbox"
        :class="{ 'has-navbar': settings.tydeModeEnabled }"
        @load="handleLoad"
        @close="handleAutoClose"
        @complete="complete"
        @change:dimensions="updateDimensions"
      />
    </div>
    <circle-of-support v-show="selectedTab === 'cos'" />
  </tapestry-modal>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex"
import client from "@/services/TapestryAPI"
import TapestryModal from "./TapestryModal"
import MultiContentMedia from "./media/MultiContentMedia"
import TapestryMedia from "./media/TapestryMedia"
import PageMenu from "./media/MultiContentMedia/PageMenu"
import { names } from "@/config/routes"
import Helpers from "@/utils/Helpers"
import { sizes } from "@/utils/constants"
import DragSelectModular from "@/utils/dragSelectModular"
import Navbar from "@/components/tyde/Navbar"
import CircleOfSupport from "@/components/tyde/activities/CircleOfSupport"
import { canEditTapestry } from "@/services/wp"

export default {
  name: "lightbox",
  components: {
    MultiContentMedia,
    TapestryMedia,
    TapestryModal,
    PageMenu,
    Navbar,
    CircleOfSupport,
  },
  props: {
    nodeId: {
      type: [Number, String],
      required: true,
    },
    rowId: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      dimensions: {
        top: 100,
        left: 50,
      },
      showCompletionScreen: false,
    }
  },
  computed: {
    ...mapState(["h5pSettings", "rootId", "settings"]),
    ...mapGetters(["getNode", "getParent", "isMultiContent", "isMultiContentRow"]),
    node() {
      const node = this.getNode(this.nodeId)
      return node
    },
    parentNode() {
      const parentNodeId = this.getParent(this.node.id)
      return this.getNode(parentNodeId)
    },
    canSkip() {
      return this.node.completed || this.node.skippable !== false
    },
    canEditTapestry() {
      return canEditTapestry()
    },
    selectedTab() {
      if (this.$route.query.tab) {
        return this.$route.query.tab
      }
      return "default"
    },
    lightboxContentStyles() {
      const styles = {
        top: this.dimensions.top + "px",
        left: this.dimensions.left + "px",
        width: this.dimensions.width + "px",
        height: this.dimensions.height + "px",
      }

      if (this.node.fullscreen || this.settings.tydeModeEnabled) {
        styles.top = "auto"
        styles.left = "auto"
        styles.width = "100vw"
        styles.height = "100vh"
        styles.position = "relative"

        const adminBar = document.getElementById("wpadminbar")
        if (adminBar) {
          styles.top = `${adminBar.clientHeight}px`
          styles.height = `calc(100vh - ${styles.top})`
        }
      }

      if (this.node.mediaType === "multi-content") {
        styles.display = "flex"
        // Reversed because PageMenu is placed after MultiContentMedia for refs to correctly render
        styles.flexDirection = "row-reverse"
        return Object.assign(styles, { padding: "24px" })
      }

      if (this.node.mediaType === "text" || this.node.mediaType === "wp-post") {
        return Object.assign(styles, {
          background: "var(--background-color);",
          padding: "1em",
        })
      }

      return styles
    },
    lightboxDimensions() {
      if (!this.node) {
        return {}
      }

      const { mediaWidth: width, mediaHeight: height } = this.node.typeData
      const browserWidth = Helpers.getBrowserWidth()
      const browserHeight = Helpers.getBrowserHeight()

      if (this.node.fullscreen) {
        return {
          width: browserWidth,
          height: browserHeight,
        }
      }

      let resizeRatio = 1
      let videoWidth = width
      let videoHeight = height

      if (width > Helpers.getBrowserWidth()) {
        resizeRatio *= browserWidth / width
        videoWidth *= resizeRatio
        videoHeight *= resizeRatio
      }

      if (videoHeight > browserHeight * resizeRatio) {
        resizeRatio *= browserHeight / videoHeight
        videoWidth *= resizeRatio
        videoHeight *= resizeRatio
      }

      const nodeSpace = sizes.NODE_RADIUS * 2 * 1.3
      const adjustedVideoHeight = Math.min(videoHeight, browserHeight - nodeSpace)
      const adjustedVideoWidth = Math.min(videoWidth, browserWidth - nodeSpace)

      const heightAdjustmentRatio = adjustedVideoHeight / videoHeight
      const widthAdjustmentRatio = adjustedVideoWidth / videoWidth
      let adjustmentRatio = widthAdjustmentRatio
      let adjustedOn = "width"

      if (Helpers.getAspectRatio() < 1) {
        adjustedOn = "height"
        adjustmentRatio = heightAdjustmentRatio
      }

      adjustmentRatio *= 0.95
      return {
        adjustedOn,
        width: videoWidth * adjustmentRatio,
        height: videoHeight * adjustmentRatio,
      }
    },
  },
  watch: {
    nodeId: {
      immediate: true,
      handler() {
        if (!this.node) {
          // Node ID doesn't exist, so reroute to default selected node
          this.$router.replace({
            name: names.APP,
            params: { nodeId: this.rootId },
            query: this.$route.query,
          })
        } else {
          this.handleNodeChanged()
        }
      },
    },
    rowId: {
      immediate: true,
      handler(rowId) {
        if (rowId) {
          if (
            !this.isMultiContent(this.nodeId) ||
            !this.isMultiContentRow(rowId, this.nodeId)
          ) {
            this.$router.replace({
              name: names.LIGHTBOX,
              params: { nodeId: this.nodeId },
              query: this.$route.query,
            })
          }
        }
      },
    },
  },
  mounted() {
    document.querySelector("body").classList.add("tapestry-lightbox-open")
    DragSelectModular.removeDragSelectListener()
    this.handleNodeChanged()
  },
  beforeDestroy() {
    document.querySelector("body").classList.remove("tapestry-lightbox-open")
    DragSelectModular.addDragSelectListener()
    this.$router.push({
      ...this.$route,
      params: { ...this.$route.params, rowId: undefined },
      query: this.$route.query,
    })
  },
  methods: {
    ...mapActions(["completeNode", "updateNodeProgress"]),
    complete(nodeId) {
      const node = this.getNode(nodeId || this.nodeId)
      if (!node.completed) {
        this.completeNode(node.id)
      }
      if (node.progress !== 1) {
        this.updateNodeProgress({ id: node.id, progress: 1 })
      }
    },
    handleUserClose() {
      client.recordAnalyticsEvent("user", "close", "lightbox", this.nodeId)
      this.close()
    },
    handleAutoClose() {
      client.recordAnalyticsEvent("app", "close", "lightbox", this.nodeId)
      this.close()
    },
    close() {
      let selectedNode = this.nodeId
      if (
        this.parentNode?.mediaType === "multi-content" &&
        this.parentNode?.presentationStyle === "unit"
      ) {
        selectedNode = this.parentNode.id
      }
      this.$router.push({
        name: names.APP,
        params: { nodeId: selectedNode },
        query: this.$route.query,
      })
    },
    handleLoad(dimensions = {}) {
      const { width, height } = dimensions
      if (width && height) {
        this.updateDimensions({ width, height })
      }
    },
    updateDimensions(dimensions) {
      if (dimensions.height <= this.lightboxDimensions.height) {
        this.dimensions = {
          ...this.dimensions,
          ...dimensions,
        }
      }
    },
    applyDimensions() {
      this.dimensions = {
        ...this.dimensions,
        left: (Helpers.getBrowserWidth() - this.lightboxDimensions.width) / 2,
        width: this.lightboxDimensions.width,
        height: this.lightboxDimensions.height,
      }
    },
    handleNodeChanged() {
      if (
        this.node.mediaType === "multi-content" &&
        this.node.presentationStyle === "unit" &&
        this.node.childOrdering?.length
      ) {
        const pageNode = this.getNode(this.node.childOrdering[0])
        this.$root.$emit("open-node", pageNode.id)
      } else {
        this.applyDimensions()
      }
    },
  },
}
</script>

<style lang="scss">
body.tapestry-lightbox-open {
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
.content-text {
  .media-wrapper {
    overflow: auto;
  }
}

#lightbox {
  &.full-screen {
    background: var(--bg-color-primary);

    .close-btn {
      position: fixed;
      top: 50px;
      right: 50px;
    }
  }
  height: 100%;
}

.has-navbar {
  padding-top: 6rem;
}

.node-container {
  width: 100%;
  height: 100%;
  display: flex;
}
.multi-content {
  flex-direction: row-reverse;
}
.video-content {
  display: block !important;
}
</style>
