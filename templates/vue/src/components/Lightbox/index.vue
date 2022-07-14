<template>
  <b-modal
    id="lightbox"
    :visible="visible"
    hide-header-close
    hide-footer
    hide-backdrop
    size="lg"
    scrollable
    :aria-label="`You're now in a modal, viewing the content of ${node.title}.`"
    initial-focus="lightboxTitle"
    :modal-class="{
      'full-screen': node.fullscreen,
      'custom-dimensions': hasCustomDimensions,
      'content-text': node.mediaType === 'text' || node.mediaType === 'wp-post',
    }"
    :node="node"
    @show="handleShow"
    @shown="handleShown"
    @close="handleUserClose"
    @hide="handleHide"
  >
    <template #modal-header="{ close }">
      <div class="buttons-container">
        <modal-button
          v-if="canSkip"
          aria-label="Close lightbox."
          data-qa="close-lightbox"
          icon="times"
          tabindex="0"
          @clicked="close"
        />
        <modal-button
          icon="heart"
          icon-size="sm"
          :title="isFavourite ? 'Remove from Favourites' : 'Add to Favourites'"
          :icon-color="isFavourite ? 'red' : ''"
          :bg-color="isFavourite ? '#fff' : ''"
          :bg-hover-color="isFavourite ? '#fff' : 'red'"
          tabindex="0"
          @clicked="toggleFavourite(node.id)"
        />
        <modal-button
          v-if="canEditNode"
          aria-label="Edit this node."
          icon="pencil-alt"
          icon-size="sm"
          title="Edit Node"
          tabindex="0"
          @clicked="editNode"
        />
      </div>
    </template>

    <div data-qa="lightbox-content" class="content" :style="contentStyles">
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
        :dimensions="lightboxDimensions"
        context="lightbox"
        @load="handleLoad"
        @close="handleAutoClose"
        @complete="complete"
        @change:dimensions="updateDimensions"
      />
    </div>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex"
import client from "@/services/TapestryAPI"
import TapestryModal from "./TapestryModal"
import MultiContentMedia from "./media/MultiContentMedia"
import TapestryMedia from "./media/TapestryMedia"
import PageMenu from "./media/MultiContentMedia/PageMenu"
import ModalButton from "./TapestryModal/ModalButton"
import { names } from "@/config/routes"
import Helpers from "@/utils/Helpers"
import { sizes } from "@/utils/constants"

export default {
  name: "lightbox",
  components: {
    MultiContentMedia,
    TapestryMedia,
    TapestryModal,
    PageMenu,
    ModalButton,
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
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
        // top: 100,
        // left: 50,
      },
      showCompletionScreen: false,
    }
  },
  computed: {
    ...mapState(["h5pSettings", "rootId", "favourites"]),
    ...mapGetters(["getNode", "getParent", "isMultiContent", "isMultiContentRow"]),
    node() {
      const node = this.getNode(this.nodeId)
      return node
    },
    parentNode() {
      const parentNodeId = this.getParent(this.node.id)
      return this.getNode(parentNodeId)
    },
    isFavourite() {
      return this.favourites.find(id => id == this.node.id)
    },
    canSkip() {
      return this.node.completed || this.node.skippable !== false
    },
    canEditNode() {
      return Helpers.hasPermission(this.node, "edit")
    },
    hasCustomDimensions() {
      return this.dimensions.width || this.dimensions.height
    },
    contentStyles() {
      const { width, height } = this.dimensions
      return {
        width: width ? width + "px" : null,
        height: height ? height + "px" : null,
      }
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
    contentStyles: {
      immediate: true,
      handler(contentStyles) {
        const dialogElement = document.querySelector("#lightbox .modal-dialog")
        if (dialogElement) {
          dialogElement.style.width = contentStyles.width
          dialogElement.style.height = contentStyles.height
        }
      },
    },
  },
  beforeDestroy() {
    this.$router.push({
      ...this.$route,
      params: { ...this.$route.params, rowId: undefined },
      query: this.$route.query,
    })
  },
  methods: {
    ...mapActions(["completeNode", "updateNodeProgress", "toggleFavourite"]),
    ...mapMutations(["setReturnRoute"]),
    editNode() {
      this.setReturnRoute(this.$route)
      this.$router.push({
        name: names.MODAL,
        params: { nodeId: this.node.id, type: "edit", tab: "content" },
        query: { from: "lightbox" },
      })
    },
    complete(nodeId) {
      const node = this.getNode(nodeId || this.nodeId)
      if (node.progress !== 1) {
        this.updateNodeProgress({ id: node.id, progress: 1 })
      }
      if (!node.completed) {
        this.completeNode(node.id)
      }
    },
    handleShow() {
      this.dimensions = {}

      // if opening a multi-content unit node, instead go to its first visible child
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
          this.$router.replace({
            name: names.LIGHTBOX,
            params: { nodeId: firstVisible },
            query: this.$route.query,
          })
        }
      }
    },
    handleShown() {
      // this.applyDimensions()
    },
    handleHide() {
      this.close()
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
        // console.log("updateDimensions", dimensions.width, dimensions.height)
        this.dimensions = {
          ...this.dimensions,
          ...dimensions,
        }
      }

      // this.dimensions = {
      //   ...this.dimensions,
      //   ...dimensions,
      // }
    },
    applyDimensions() {
      // console.log("applyDimensions", this.lightboxDimensions.width, this.lightboxDimensions.height)
      // this.dimensions = {
      //   ...this.dimensions,
      //   left: (Helpers.getBrowserWidth() - this.lightboxDimensions.width) / 2,
      //   width: this.lightboxDimensions.width,
      //   height: this.lightboxDimensions.height,
      // }
    },
  },
}
</script>

<style lang="scss">
body.tapestry-lightbox-open {
  overflow: hidden;
}

#lightbox {
  .modal-header {
    padding: 0;
  }

  .modal-body {
    position: unset;
    padding: 0;
  }

  .modal-content {
    overflow: unset;
    background: var(--bg-color-secondary);
    color: var(--text-color-primary);
    background-position: 0 0;
    background-size: cover;
    box-shadow: 0 0 70px -40px #000;
    border-radius: 15px;
  }

  .buttons-container {
    position: absolute;
    display: flex;
    flex-direction: row-reverse;
    top: -20px;
    right: -20px;
    z-index: 1000;
  }

  .content {
    position: relative;
    height: 100%;
    overflow: hidden;
  }

  .full-height-media {
    height: 100%;
    min-height: 70vh;
  }

  &.full-screen {
    background: var(--bg-color-primary);

    .modal-dialog {
      position: relative;
      top: auto;
      left: auto;
      width: 100%;
      height: 100%;
      max-width: unset;
      max-height: unset;
      margin: 0;
    }

    .modal-content {
      max-width: unset;
      max-height: unset;
    }

    .buttons-container {
      top: 20px;
      right: 30px;
    }

    .content {
      border-radius: 0;
    }
  }

  &.custom-dimensions {
    .modal-dialog {
      max-width: unset;
      max-height: unset;
    }

    .modal-content {
      max-width: unset;
      max-height: unset;
    }
  }
}
</style>

<style lang="scss" scoped>
.content-text {
  .media-wrapper {
    overflow: auto;
  }
}
</style>
