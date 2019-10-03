<template>
  <video @loadstart="$emit('load')" @loadedmetadata="setVideoTime" @timeupdate="updateVideoProgress" ref="video">
    <source id="video-source" :src="data.url" type="video/mp4" />
  </video>
</template>

<script>
export default {
  name: 'video-media',
  props: ['data'],
  mounted() {
    setTimeout(() => this.$refs.video.play(), 1000)
  },
  methods: {
    setVideoTime() {
      /* const video = this.$refs.video
      const viewedAmount = this.node.typeData.progress[0].value * video.duration

      if (viewedAmount > 0 && viewedAmount <= video.duration) {
        video.currentTime = viewedAmount
      } else {
        video.currentTime = 0
      } */
    },
    updateVideoProgress() {
      /* const video = this.$refs.video
      const amountViewed = video.currentTime / video.duration
      const amountNotViewed = 1.00 - amountViewed
      this.node.typeData.progress[0].value = amountViewed
      this.node.typeData.progress[1].value = amountNotViewed
      console.log(this.node) */

      // TODO: Save to database
      // TODO: Update progress bar in d3
    },
  }
}
</script>

<style scoped>

</style>
