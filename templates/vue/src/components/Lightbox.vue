<template>
  <tapestry-modal
    id="lightbox"
    :class="{
      'full-screen': node.fullscreen,
      'content-text': node.mediaType === 'text' || node.mediaType === 'wp-post',
    }"
    :node-id="nodeId"
    :content-container-style="lightboxContentStyles"
    :allow-close="canSkip"
    @close="handleUserClose"
  >
    <accordion-media
      v-if="node.mediaType === 'accordion'"
      :node="node"
      @close="handleAutoClose"
      @complete="complete"
    />
    <tapestry-media
      v-else
      :node-id="nodeId"
      :dimensions="dimensions"
      @load="handleLoad"
      @close="handleAutoClose"
      @complete="complete"
      @change:dimensions="updateDimensions"
    />
  </tapestry-modal>
</template>

<script>
import TapestryModal from "./TapestryModal"
import AccordionMedia from "./lightbox/AccordionMedia"
import TapestryMedia from "./TapestryMedia"
import Helpers from "@/utils/Helpers"
import { sizes, tydeTypes } from "@/utils/constants"
import { mapActions, mapMutations, mapGetters, mapState } from "vuex"
import client from "@/services/TapestryAPI"

export default {
  name: "lightbox",
  components: {
    AccordionMedia,
    TapestryMedia,
    TapestryModal,
  },
  props: {
    nodeId: {
      type: [String, Number],
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      isLoaded: false,
      dimensions: {
        top: 100,
        left: 50,
      },
      timeSinceLastSaved: new Date(),
      showCompletionScreen: false,
    }
  },
  computed: {
    ...mapState(["h5pSettings"]),
    ...mapGetters(["getNode", "getDirectParents"]),
    node() {
      return this.getNode(this.nodeId)
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
      }

      if (this.node.mediaType === "accordion") {
        return Object.assign(styles, { background: "white" })
      }

      if (this.node.mediaType === "text" || this.node.mediaType === "wp-post") {
        return Object.assign(styles, {
          background: "#eee",
          color: "#333",
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
    nodeId() {
      this.applyDimensions()
    },
  },
  mounted() {
    this.isLoaded = true
    this.applyDimensions()
    document.querySelector("body").classList.add("tapestry-lightbox-open")
  },
  beforeDestroy() {
    document.querySelector("body").classList.remove("tapestry-lightbox-open")
  },
  methods: {
    ...mapActions(["completeNode", "updateMayUnlockNodes"]),
    ...mapMutations(["updateTydeProgress"]),
    complete() {
      if (Helpers.canUserUpdateProgress(this.node)) {
        this.completeNode(this.nodeId)
        const stages = this.getDirectParents(this.nodeId).filter(
          id => this.getNode(id).tydeType === tydeTypes.STAGE
        )
        stages.map(sid =>
          this.updateTydeProgress({ parentId: sid, isParentModule: false })
        )
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
      this.$router.go(-1)
    },
    handleLoad(dimensions) {
      if (dimensions) {
        const { width, height } = dimensions
        this.updateDimensions({ width, height })
      }
    },
    updateDimensions(dimensions) {
      this.dimensions = {
        ...this.dimensions,
        ...dimensions,
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
    overflow: scroll;
  }
}

#lightbox {
  &.full-screen {
    background: #000;

    .close-btn {
      position: fixed;
      top: 50px;
      right: 50px;
    }
  }
  height: 100%;
}
</style>
