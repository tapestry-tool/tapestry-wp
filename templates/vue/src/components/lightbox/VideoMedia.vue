<template>
  <video
    ref="video"
    class="video"
    controls
    @loadstart="handleLoad"
    @loadedmetadata="setVideoTime"
    @play="handlePlay"
    @pause="handlePause"
    @timeupdate="updateVideoProgress"
  >
    <source id="video-source" :src="node.typeData.mediaURL" type="video/mp4" />
  </video>
</template>

<script>
const ALLOW_SKIP_THRESHOLD = 0.95

export default {
  name: "video-media",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      lastSaved: null,
    }
  },
  mounted() {
    setTimeout(() => {
      this.$refs.video.play()
      thisTapestryTool.recordAnalyticsEvent(
        "app",
        "auto-play",
        "html5-video",
        this.node.id
      )
    }, 1000)
  },
  beforeDestroy() {
    this.$refs.video.pause()
    this.updateVideoProgress()
  },
  methods: {
    handleLoad() {
      const videoRect = this.$refs.video.getBoundingClientRect()
      this.$emit("load", { width: videoRect.width, height: videoRect.height })
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
    setVideoTime() {
      const video = this.$refs.video
      const viewedAmount = this.node.typeData.progress[0].value * video.duration
      if (viewedAmount > 0 && viewedAmount !== video.duration) {
        video.currentTime = viewedAmount
      } else {
        video.currentTime = 0
      }
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

      thisTapestryTool.updateChildren(this.node.id, video)
      thisTapestryTool.updateProgressBars()
    },
  },
}
</script>

<style scoped>
.video {
  width: 100%;
  height: auto;
}
</style>
