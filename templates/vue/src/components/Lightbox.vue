<template>
  <div>
    <div id="spotlight-overlay"></div>
    <div id="spotlight-content">
      <button id='lightbox-close-wrapper' @click="$emit('close')">
        <div class='lightbox-close'>
          <i class='fa fa-times'></i>
        </div>
      </button>
      <div class="media-wrapper">
        {{ nodeId }}
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

  },
  data() {
    return {
      lightbox: {},
    }
  },
  computed: {
    adjustedLightbox() {
      return {
        ...this.lightbox,
        width: this.lightboxDimensions.width,
        height: this.lightboxDimensions.height
      }
    },
    lightboxContentStyles() {
      return {
        left: (Helpers.getBrowserWidth() - this.lightboxDimensions.width) / 2,
        width: this.lightboxDimensions.width,
        height: this.lightboxDimensions.height
      }
    },
    lightboxDimensions() {
      const NORMAL_RADIUS = 140 // TODO: Refactor this to "constants" folder

      const { width, height } = this.lightbox
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
        browserHeight - nodeSpace
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
    }
  }
}
</script>

<style scoped>

</style>
