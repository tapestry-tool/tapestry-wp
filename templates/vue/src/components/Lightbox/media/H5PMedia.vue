<template>
  <div>
    <h1 v-if="showTitle" class="wp-h5p-title">
      {{ node.title }}
      <completed-icon :node="node" class="mx-2" />
    </h1>
    <div
      ref="h5pMediaIFrameContainer"
      class="h5p-media-iframe-container"
      :class="{
        'context-multi-content': hasMultiContentContext,
      }"
      :style="{
        height: frameHeight ? `${iframeHeight}px` : iframeHeight,
        width: '100%',
      }"
    >
      <iframe
        id="h5p"
        ref="h5p"
        :height="iframeHeight"
        width="100%"
        frameborder="0"
        :src="node.typeData && node.typeData.mediaURL"
        :scrolling="scrollingValue"
        @load="handleLoad"
        @close="$emit('close')"
      ></iframe>
    </div>
  </div>
</template>

<script>
import CompletedIcon from "@/components/common/CompletedIcon"

export default {
  name: "h5p-media",
  components: {
    CompletedIcon,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    dimensions: {
      type: Object,
      required: true,
    },
    context: {
      type: String,
      required: true,
    },
    hideTitle: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      library: null,
      frameHeight: null,
      frameWidth: null,
      refreshed: false,
    }
  },
  computed: {
    scrollingValue() {
      const noscroll = ["H5P.ThreeImage"]
      if (noscroll.includes(this.library) || this.context !== "lightbox") {
        return "no"
      } else return "auto"
    },
    hasMultiContentContext() {
      return this.context === "multi-content"
    },
    iframeHeight() {
      if (this.frameHeight) {
        if (this.context === "lightbox") {
          return Math.min(this.frameHeight, this.dimensions.height)
        } else {
          return this.frameHeight
        }
      } else {
        return "100%"
      }
    },
    showTitle() {
      return (
        !this.hideTitle &&
        this.context === "multi-content" &&
        this.node.typeData.showTitle !== false
      )
    },
  },
  methods: {
    handleLoad() {
      const h5pObj = this.$refs.h5p.contentWindow.H5P
      const h5pInstance = h5pObj.instances[0]
      const loadedH5PId = h5pInstance.contentId

      this.library = h5pInstance.libraryInfo.machineName
      this.frameHeight = this.dimensions.height
      this.frameWidth = this.dimensions.width

      // Check to see whether this is an H5P recorder
      // If it is, we can emit an event to load the recorded audio (if exists)
      // and terminate
      if (h5pInstance.recorder && loadedH5PId) {
        this.loadedH5PRecorderId = loadedH5PId
        this.h5pRecorderSaverIsLoaded()
        return
      }

      const h5pDocument = this.$refs.h5p.contentWindow.document
      const h5pContent =
        h5pDocument.querySelector(".h5p-content") ??
        h5pDocument.activeElement.children[0]
      const h5pContentHeight = h5pContent.clientHeight
      if (h5pContentHeight > 0) {
        this.frameHeight = h5pContentHeight
        this.$emit("change:dimensions", { height: this.frameHeight })
      }

      // Watch for changes in the body of the iframe and update dimensions to match that
      let that = this
      let heightChangeTimeout
      var ro = new ResizeObserver(entries => {
        for (let entry of entries) {
          const height = entry.contentRect.height
          if (height > 0) {
            clearTimeout(heightChangeTimeout)
            that.frameHeight = height
            heightChangeTimeout = setTimeout(() => {
              this.$emit("change:dimensions", { height: that.frameHeight })
            }, 1000)
          }
        }
      })
      ro.observe(h5pContent)

      switch (this.library) {
        case "H5P.ThreeImage":
          {
            let threeSixtyLoadInterval = setInterval(() => {
              if (typeof h5pInstance.reDraw !== "undefined") {
                clearInterval(threeSixtyLoadInterval)
                if (this.node.typeData && this.node.typeData.scene) {
                  h5pInstance.currentScene = this.node.typeData.scene
                  h5pInstance.reDraw()
                }
              }
              this.$emit("load")
              this.$emit("complete")
            }, 500)
          }
          break
        default:
          this.$emit("load")
          this.$emit("complete")
          break
      }
    },
  },
}
</script>

<style lang="scss" scoped>
h1 {
  font-size: 1.75rem;
  font-weight: 500;
  text-align: left;
  margin-bottom: 0.5em;
}

.container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100vw;
  padding: 0;
}

.h5p-media-iframe-container {
  margin: auto;
  overflow: hidden;
  border-radius: 5px;
  &:not(.context-multi-content) {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  }
  iframe {
    margin: -1px !important;
    min-width: calc(100% + 4px);
  }
}
</style>
