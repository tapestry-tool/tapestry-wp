<template>
  <video
    @loadstart="handleLoad"
    @loadedmetadata="setVideoTime"
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
    setTimeout(() => this.$refs.video.play(), 1000)
  },
  methods: {
    handleLoad() {
      const videoRect = this.$refs.video.getBoundingClientRect();
      this.$emit('load', { width: videoRect.width, height: videoRect.height })
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
      thisTapestryTool.saveVideoProgress(this.node.id, video)
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
