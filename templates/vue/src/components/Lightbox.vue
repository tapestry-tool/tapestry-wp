<template>
  <div v-if="isLoaded" id="lightbox" ref="container">
    <div id="spotlight-overlay" @click="$emit('close')"></div>
    <div id="spotlight-content" :style="lightboxContentStyles">
      <button id='lightbox-close-wrapper' @click="$emit('close')">
        <div class='lightbox-close'>
          <i class='fa fa-times'></i>
        </div>
      </button>
      <div class="media-wrapper">
        <VideoMedia :node="lightbox" @load="updateDimensions" />
      </div>
    </div>
  </div>
</template>

<script>
import VideoMedia from './VideoMedia'
import Helpers from '../utils/Helpers'

export default {
  name: 'lightbox',
  props: ['nodeId', 'tapestryApiClient'],
  components: {
    VideoMedia,
  },
  async mounted() {
    const node = await this.tapestryApiClient.getNode(this.nodeId);
    this.lightbox = node;
    this.isLoaded = true;
    this.dimensions = {
      ...this.dimensions,
      left: (Helpers.getBrowserWidth() - this.lightboxDimensions.width) / 2,
      width: this.lightboxDimensions.width,
      height: this.lightboxDimensions.height,
    }
  },
  async beforeDestroy() {
    await this.tapestryApiClient.updateUserProgress(this.nodeId, this.lightbox && this.lightbox.typeData.progress[0].value)
  },
  data() {
    return {
      lightbox: {},
      isLoaded: false,
      dimensions: {
        top: 100,
        left: 50
      },
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
      if (!this.lightbox) {
        return {}
      }

      const { mediaWidth: width, mediaHeight: height } = this.lightbox.typeData
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
      console.log(width, height)
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
}
</style>
