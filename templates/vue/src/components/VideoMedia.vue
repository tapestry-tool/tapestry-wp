<template>
  <video
    @loadstart="handleLoad"
    @loadedmetadata="setVideoTime"
    @play="handlePlay"
    @pause="handlePause"
    @timeupdate="updateVideoProgress"
    ref="video"
    class="video"
    controls
  >
    <source id="video-source" :src="node.typeData.mediaURL" type="video/mp4" />
  </video>
</template>

<script>
export default {
  name: 'video-media',
  props: ['node'],
  mounted() {
    setTimeout(() => {
      this.$refs.video.play()
      thisTapestryTool.recordAnalyticsEvent('app', 'auto-play', 'html5-video', this.node.id);
    }, 1000)
  },
  beforeDestroy() {
    this.$refs.video.pause()
    this.updateVideoProgress()
  },
  methods: {
    handleLoad() {
      const videoRect = this.$refs.video.getBoundingClientRect();
      this.$emit('load', { width: videoRect.width, height: videoRect.height })
    },
    handlePlay() {
      const { id, mediaType } = this.node
      const video = this.$refs.video
      thisTapestryTool.updateMediaIcon(
        this.node.id,
        this.node.mediaType,
        'pause'
      )
      thisTapestryTool.recordAnalyticsEvent(
        'user',
        'play',
        'html5-video',
        id,
        { time: video.currentTime }
      )
    },
    handlePause() {
      const { id, mediaType } = this.node
      const video = this.$refs.video
      thisTapestryTool.updateMediaIcon(
        this.node.id,
        this.node.mediaType,
        'play'
      )
      thisTapestryTool.recordAnalyticsEvent(
        'user',
        'pause',
        'html5-video',
        id,
        { time: video.currentTime }
      )
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
      const amountNotViewed = 1.00 - amountViewed
      this.$set(this.node.typeData.progress[0], 'value', amountViewed)
      this.$set(this.node.typeData.progress[1], 'value', amountNotViewed)
      thisTapestryTool.updateChildren(this.node.id, video)
      thisTapestryTool.saveVideoProgress(this.node.id, video.currentTime, video.duration)
    },
  }
}
</script>

<style scoped>
.video {
  width: 100%;
  height: auto;
}
</style>
