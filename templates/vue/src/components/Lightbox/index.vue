<template>
  <b-modal
    id="lightbox"
    :visible="visible"
    hide-header
    hide-footer
    hide-backdrop
    :return-focus="`.node[data-id='${returnFocusTo}']`"
    size="lg"
    scrollable
    :aria-label="`You're now in a modal, viewing the content of ${node.title}.`"
    initial-focus="lightboxTitle"
    :modal-class="{
      'full-screen': node.fullscreen,
      'custom-dimensions': isUsingCustomDimensions,
      'content-text': node.mediaType === 'text' || node.mediaType === 'wp-post',
    }"
    :node="node"
    @show="handleShow"
    @shown="handleShown"
    @close="handleUserClose"
    @hidden="handleHidden"
  >
    <template #default="{ close }">
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
          icon="info-circle"
          icon-size="sm"
          :title="showInformation ? 'Hide information' : 'Show information'"
          :icon-color="showInformation ? 'var(--highlight-color)' : ''"
          :bg-color="showInformation ? '#fff' : ''"
          :bg-hover-color="showInformation ? '#fff' : 'var(--highlight-color)'"
          tabindex="0"
          @clicked="showInformation = !showInformation"
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
      <div data-qa="lightbox-content" class="content" :style="contentStyles">
        <transition name="slide-down">
          <div v-if="showInformation" class="information-sheet">
            <h1 class="information-header">{{ node.title }}</h1>
            <section v-if="node.description">
              <h2 class="content-header">About</h2>
              <div class="content-body" v-html="node.description"></div>
            </section>
            <node-license :node="node"></node-license>
            <section v-if="node.references">
              <h2 class="content-header">References</h2>
              <div class="content-body" v-html="node.references"></div>
            </section>
          </div>
        </transition>
        <multi-content-media
          v-if="node.mediaType === 'multi-content'"
          id="multicontent-container"
          context="lightbox"
          :node="node"
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
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex"
import client from "@/services/TapestryAPI"
import MultiContentMedia from "./media/MultiContentMedia"
import TapestryMedia from "./media/TapestryMedia"
import PageMenu from "./media/MultiContentMedia/PageMenu"
import NodeLicense from "@/components/common/NodeLicense"
import ModalButton from "./ModalButton"
import { names } from "@/config/routes"
import Helpers from "@/utils/Helpers"

export default {
  name: "lightbox",
  components: {
    MultiContentMedia,
    TapestryMedia,
    PageMenu,
    ModalButton,
    NodeLicense,
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
      dimensions: {},
      isUsingCustomDimensions: false,
      showInformation: false,
    }
  },
  computed: {
    ...mapState(["h5pSettings", "favourites", "browserDimensions"]),
    ...mapGetters([
      "getNode",
      "getParent",
      "isMultiContent",
      "isMultiContentRow",
      "getInitialNodeId",
    ]),
    node() {
      const node = this.getNode(this.nodeId)
      return node
    },
    parentNode() {
      const parentNodeId = this.getParent(this.node.id)
      return this.getNode(parentNodeId)
    },
    returnFocusTo() {
      return this.parentNode?.mediaType === "multi-content" &&
        this.parentNode?.presentationStyle === "unit"
        ? this.parentNode.id
        : this.nodeId
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
    shouldUseCustomDimensions() {
      return !(
        this.node.fullscreen ||
        this.node.mediaType === "text" ||
        this.node.mediaType === "wp-post" ||
        this.node.mediaType === "multi-content" ||
        this.node.mediaType === "url-embed"
      )
    },
    contentStyles() {
      const { width, height } = this.shouldUseCustomDimensions ? this.dimensions : {}
      return {
        width: width ? width + "px" : null,
        height: height ? height + "px" : null,
      }
    },
    lightboxDimensions() {
      if (!this.node) {
        return {}
      }

      const browserWidth = this.browserDimensions.width
      const browserHeight = this.browserDimensions.height

      if (this.node.fullscreen) {
        return {
          width: browserWidth,
          height: browserHeight,
        }
      }

      const width = this.node.typeData.mediaWidth ?? 960
      const height = this.node.typeData.mediaHeight ?? 600
      const aspectRatio = width / height

      // fit content within max. possible dimensions of modal while maintaining the aspect ratio of media
      // marginSpace = 3rem for the b-modal default vert. margin
      const marginSpace = Helpers.remToPx(3)
      let adjustedHeight = height
      let adjustedWidth = width
      if (adjustedHeight > browserHeight - marginSpace) {
        adjustedHeight = browserHeight - marginSpace
        adjustedWidth = adjustedHeight * aspectRatio
      }
      if (adjustedWidth > browserWidth - marginSpace) {
        adjustedWidth = browserWidth - marginSpace
        adjustedHeight = adjustedWidth / aspectRatio
      }

      return {
        width: adjustedWidth,
        height: adjustedHeight,
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
            params: { nodeId: this.getInitialNodeId },
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
      handler() {
        this.applyContentStyles()
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
      this.showInformation = false

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

      this.applyDimensions()
    },
    handleShown() {
      this.applyContentStyles()
    },
    handleHidden() {
      this.close()
    },
    handleUserClose() {
      client.recordAnalyticsEvent("user", "close", "lightbox", this.nodeId)
    },
    handleAutoClose() {
      client.recordAnalyticsEvent("app", "close", "lightbox", this.nodeId)
      this.close()
    },
    close() {
      this.$router.push({
        name: names.APP,
        params: { nodeId: this.returnFocusTo },
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
      // use default Bootstrap modal width until applyContentStyles has succeeded
      this.isUsingCustomDimensions = false
      this.dimensions = {
        width: this.lightboxDimensions.width,
        height: this.lightboxDimensions.height,
      }
    },
    applyContentStyles() {
      const dialogElement = document.querySelector("#lightbox .modal-dialog")
      if (dialogElement) {
        dialogElement.style.width = this.contentStyles.width
        dialogElement.style.height = this.contentStyles.height
        this.isUsingCustomDimensions = this.shouldUseCustomDimensions
      } else {
        this.isUsingCustomDimensions = false
      }
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
    border: unset;
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
    border-radius: 15px;
  }

  .information-sheet {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    max-height: 100%;
    z-index: 100;
    overflow: auto;
    padding: 20px;
    box-sizing: border-box;
    background-color: #5d656c;
    color: #becddc;
    text-align: left;
    box-shadow: 0 0 20px #000;

    &.slide-down-enter-active,
    &.slide-down-leave-active {
      transition: margin-top 0.3s ease-in-out;
    }
    &.slide-down-enter,
    &.slide-down-leave-to {
      margin-top: -100%;
    }

    .content-header {
      color: #fff;
      margin: 1em -1em 0.2em;
      border-bottom: solid 2px #6b747d;
      padding: 0.2em 1em;
      font-size: 1.75em;
    }

    .content-body {
      display: block;
      text-align: left;
      color: #becddc;

      a {
        color: #becddc;
        text-decoration: underline;
        &:hover {
          color: #fff;
        }
      }
    }

    .information-header {
      color: #fff;
      font-size: 1.75rem;
      font-weight: 500;
      margin-bottom: 1em;
    }
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
      border-radius: 0;
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
