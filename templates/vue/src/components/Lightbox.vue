<template>
    <div id="lightbox">
      <div id="spotlight-overlay" @click="$emit('close')"></div>
      <transition name="lightbox">
        <div v-if="isLoaded" id="spotlight-content" :class="['content', { 'content-text': this.node.mediaType === 'text' }]" :style="lightboxContentStyles">
          <button id='lightbox-close-wrapper' @click="$emit('close')">
            <div class='lightbox-close'>
              <i class='fa fa-times'></i>
            </div>
          </button>
          <div
            :class="[
              'media-wrapper',
              { 'media-wrapper-embed': node.mediaFormat === 'embed' }
            ]"
          >
            <TextMedia v-if="node.mediaType === 'text'" :node="node" />
            <VideoMedia
              v-if="node.mediaFormat === 'mp4'"
              :node="node"
              @load="updateDimensions"
            />
            <ExternalMedia
              v-if="node.mediaFormat === 'embed'"
              :node="node"
              :width="this.dimensions.width"
              :height="this.dimensions.height"
            />
            <H5PMedia
              v-if="node.mediaFormat === 'h5p'"
              :node="node"
              :width="this.dimensions.width"
              :height="this.dimensions.height"
              :settings="this.h5pSettings"
            />
          </div>
        </div>
      </transition>
    </div>
</template>

<script>
import TextMedia from './TextMedia'
import VideoMedia from './VideoMedia'
import ExternalMedia from './ExternalMedia'
import H5PMedia from './H5PMedia'
import Helpers from '../utils/Helpers'

export default {
  name: 'lightbox',
  props: ['nodeId', 'tapestryApiClient'],
  components: {
    VideoMedia,
    TextMedia,
    ExternalMedia,
    H5PMedia,
  },
  async mounted() {
    const node = await this.tapestryApiClient.getNode(this.nodeId)
    const meta = await this.tapestryApiClient.getNodeProgress(this.nodeId)
    node.typeData.progress[0].value = meta.progress
    node.typeData.progress[1].value = 1.00 - meta.progress

    const settings = await this.tapestryApiClient.getH5pSettings()
    this.h5pSettings = settings

    this.node = node;
    this.isLoaded = true;
    this.dimensions = {
      ...this.dimensions,
      left: (Helpers.getBrowserWidth() - this.lightboxDimensions.width) / 2,
      width: this.lightboxDimensions.width,
      height: this.lightboxDimensions.height,
    }
  },
  async beforeDestroy() {
    await this.tapestryApiClient.updateUserProgress(this.nodeId, this.node && this.node.typeData.progress[0].value)
  },
  data() {
    return {
      node: {},
      isLoaded: false,
      dimensions: {
        top: 100,
        left: 50
      },
      h5pSettings: {}
    }
  },
  computed: {
    lightboxContentStyles() {
      return {
        top: this.dimensions.top + "px",
        left: this.dimensions.left + "px",
        width: this.dimensions.width + "px",
        height: this.dimensions.height + "px"
      }
    },
    lightboxDimensions() {
      const NORMAL_RADIUS = 140 // TODO: Refactor this to "constants" folder
      if (!this.node) {
        return {}
      }

      const { mediaWidth: width, mediaHeight: height } = this.node.typeData
      const browserWidth = Helpers.getBrowserWidth()
      const browserHeight = Helpers.getBrowserHeight()

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

      const nodeSpace = NORMAL_RADIUS * 2 * 1.3
      const adjustedVideoHeight = Math.min(
        videoHeight,
        browserHeight - nodeSpace
      )
      const adjustedVideoWidth = Math.min(
        videoWidth,
        browserWidth - nodeSpace
      )

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
        height: videoHeight * adjustmentRatio
      }
    },
  },
  methods: {
    updateDimensions({ width, height }) {
      this.dimensions = {
        ...this.dimensions,
        width,
        height
      }
    }
  }
}
</script>

<style scoped>
#lightbox {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  opacity: 1;
  transform: translateY(0);
}

#spotlight-overlay {
  width: 100%;
  height: 100%;
  position: fixed;
}

.content {
  position: absolute;
  top: 5vh;
  left: 5vw;
  height: 90vh;
  width: 90vw;
  z-index: 100;
  background-position: 0 0;
  background-size: cover;
  background-color: black;
  box-shadow: 0 0 100px -40px #000;
  border-radius: 15px;
}

.media-wrapper {
  background: #000;
  outline: none;
  border-radius: 15px;
  overflow: hidden;
}

.media-wrapper-embed {
  background: white;
}

.content-text {
  outline: none;
  background: #eee;
  color: #333;
  padding: 1em;
}

.content-text .media-wrapper {
  height: 100%;
  overflow: scroll;
  background: transparent;
}
</style>

<style>
.lightbox-enter-active, .lightbox-leave-active {
  transition: all 1s;
}

.lightbox-enter, .lightbox-leave-to {
  opacity: 0;
  transform: translateY(32px);
}
</style>
