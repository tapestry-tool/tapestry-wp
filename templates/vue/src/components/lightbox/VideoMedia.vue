<template>
  <div class="container">
    <end-screen v-if="showEndScreen" />
    <video
      ref="video"
      class="video"
      controls
      autoplay
      @loadedmetadata="handleLoad"
      @play="handlePlay"
      @pause="handlePause"
      @timeupdate="updateVideoProgress"
    >
      <source id="video-source" :src="node.typeData.mediaURL" type="video/mp4" />
    </video>
  </div>
</template>

<script>
import EndScreen from "./EndScreen"

const ALLOW_SKIP_THRESHOLD = 0.95

export default {
  name: "video-media",
  components: {
    EndScreen,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showEndScreen: this.getInitialEndScreenState(),
    }
  },
  beforeDestroy() {
    if (this.$refs.video) {
      this.$refs.video.pause()
      this.updateVideoProgress()
    }
  },
  methods: {
    rewatch() {
      this.showEndScreen = false
      this.$refs.video.currentTime = 0
      this.$refs.video.play()
    },
    close() {
      if (this.$refs.video) {
        this.$refs.video.pause()
        this.updateVideoProgress()
      }
      this.$emit("close")
    },
    getInitialEndScreenState() {
      const progress = this.node.typeData.progress[0].value
      if (progress >= 1) {
        return true
      }
      if (this.$refs.video) {
        const viewedAmount = progress * this.$refs.video.duration
        return this.$refs.video.duration <= viewedAmount
      }
      return false
    },
    handlePlay() {
      const { id, mediaType } = this.node
      const video = this.$refs.video
      thisTapestryTool.updateMediaIcon(id, mediaType, "pause")
      thisTapestryTool.recordAnalyticsEvent("user", "play", "html5-video", id, {
        time: video.currentTime,
      })
    },
    handlePause() {
      const { id, mediaType } = this.node
      const video = this.$refs.video
      thisTapestryTool.updateMediaIcon(id, mediaType, "play")
      thisTapestryTool.recordAnalyticsEvent("user", "pause", "html5-video", id, {
        time: video.currentTime,
      })
    },
    handleLoad() {
      const video = this.$refs.video
      const videoRect = this.$refs.video.getBoundingClientRect()
      this.$emit("load", { width: videoRect.width, height: videoRect.height })

      const progress = this.node.typeData.progress[0].value
      const viewedAmount = progress * video.duration
      video.currentTime = viewedAmount
    },
    updateVideoProgress() {
      const video = this.$refs.video
      const amountViewed = video.currentTime / video.duration
      const amountNotViewed = 1.0 - amountViewed

      this.$emit("timeupdate", "video", amountViewed)
      this.$set(this.node.typeData.progress[0], "value", amountViewed)
      this.$set(this.node.typeData.progress[1], "value", amountNotViewed)

      if (amountViewed >= ALLOW_SKIP_THRESHOLD) {
        this.$set(this.node, "completed", true)
        this.$emit("complete")
      }

      if (amountViewed >= 1) {
        this.showEndScreen = true
      }

      thisTapestryTool.updateChildren(this.node.id, video)
      thisTapestryTool.updateProgressBars()
    },
  },
}
</script>

<style scoped>
.video {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: auto;
}

.container {
  position: relative;
  width: 100%;
  height: 100%;
}

.video {
  width: 100%;
  height: auto;
}
</style>
