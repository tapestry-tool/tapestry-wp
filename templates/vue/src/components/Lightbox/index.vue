<template>
  <tapestry-modal
    v-if="node"
    id="lightbox"
    data-qa="lightbox"
    :class="{
      'full-screen': node.fullscreen,
      'content-text': node.mediaType === 'text' || node.mediaType === 'wp-post',
    }"
    :node="node"
    :content-container-style="lightboxContentStyles"
    :allow-close="canSkip"
    @close="handleUserClose"
  >
    <multi-content-media
      v-if="node.mediaType === 'multi-content'"
      id="multicontent-container"
      context="lightbox"
      :node="node"
      :menu-dimensions="dimensions"
      :row-id="rowId"
      @close="handleAutoClose"
      @complete="complete"
    />
    <tapestry-media
      v-if="node.mediaType !== 'multi-content'"
      :node-id="nodeId"
      :dimensions="dimensions"
      context="lightbox"
      @load="handleLoad"
      @close="handleAutoClose"
      @complete="complete"
      @change:dimensions="updateDimensions"
    />
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

export default {
  name: "lightbox",
  components: {
    MultiContentMedia,
    TapestryMedia,
    TapestryModal,
    PageMenu,
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
    ...mapState(["h5pSettings", "rootId"]),
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
    lightboxContentStyles() {
      const styles = {
        top: this.dimensions.top + "px",
        left: this.dimensions.left + "px",
        width: this.dimensions.width + "px",
        height: this.dimensions.height + "px",
      }

      if (this.node.fullscreen) {
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

      const width = this.node.typeData.mediaWidth ?? 960
      const height = this.node.typeData.mediaHeight ?? 600
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
      if (node.progress !== 1) {
        this.updateNodeProgress({ id: node.id, progress: 1 })
      }
      if (!node.completed) {
        this.completeNode(node.id)
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
      if (dimensions.height > 0) {
        dimensions.height = Math.min(
          dimensions.height,
          this.lightboxDimensions.height
        )
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
        const firstVisible = this.node.childOrdering.find(id => {
          const node = this.getNode(id)
          return node.unlocked || !node.hideWhenLocked
        })
        if (firstVisible) {
          this.$root.$emit("open-node", firstVisible)
        } else {
          this.applyDimensions()
        }
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
</style>
