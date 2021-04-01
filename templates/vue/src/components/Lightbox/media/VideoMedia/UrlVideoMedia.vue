<template>
  <div :class="['video-container', { fullscreen: node.fullscreen }]">
    <video
      ref="video"
      controls
      :src="node.typeData.mediaURL"
      :style="videoStyles"
      @loadeddata="handleLoad"
      @play="handlePlay"
      @pause="handlePause"
      @timeupdate="updateVideoProgress"
    ></video>
  </div>
</template>

<script>
import client from "@/services/TapestryAPI"

export default {
  name: "url-video-media",
  props: {
    node: {
      type: Object,
      required: true,
    },
    autoplay: {
      type: Boolean,
      required: false,
      default: true,
    },
    dimensions: {
      type: Object,
      required: true,
      validator: val => {
        return ["width", "height"].every(prop => val.hasOwnProperty(prop))
      },
    },
    playing: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      videoDimensions: null,
    }
  },
  computed: {
    videoStyles() {
      if (!this.videoDimensions) {
        return { width: "100%" }
      }
      const { height, width } = this.videoDimensions
      if (width / height <= 1) {
        return { height: "100%", width: "auto" }
      }

      /**
       * If the video is full screen, we want to fit it into the window based on its
       * aspect ratio.
       */
      if (this.node.fullscreen && this.node.fitWindow) {
        if (width > window.innerWidth) {
          const resizeRatio = window.innerWidth / width
          const newHeight = height * resizeRatio
          if (newHeight >= window.innerHeight) {
            return { height: "100%", width: "auto" }
          }
        } else if (height > window.innerHeight) {
          return { height: "100%", width: "auto" }
        }
      }
      return { width: "100%" }
    },
  },
  watch: {
    playing(isPlaying) {
      if (isPlaying) {
        this.$refs.video.play()
      } else {
        this.$refs.video.pause()
      }
    },
  },
  beforeDestroy() {
    this.updateVideoProgress()
  },
  methods: {
    reset() {
      this.$refs.video.currentTime = 0
    },
    handlePlay() {
      this.$emit("play")
      client.recordAnalyticsEvent("user", "play", "html5-video", this.node.id, {
        time: this.$refs.video.currentTime,
      })
    },
    handlePause() {
      this.$emit("pause")
      client.recordAnalyticsEvent("user", "pause", "html5-video", this.node.id, {
        time: this.$refs.video.currentTime,
      })
    },
    handleLoad() {
      const video = this.$refs.video
      this.videoDimensions = {
        height: video.videoHeight,
        width: video.videoWidth,
      }
      const currentTime = this.node.progress * video.duration
      video.currentTime = currentTime

      /**
       * If the `playing` prop is set to true when the video's loaded, the video
       * will autoplay so we should record it accordingly in analytics.
       */
      if (this.playing) {
        client.recordAnalyticsEvent(
          "app",
          "auto-play",
          "html5-video",
          this.node.id,
          {
            time: video.currentTime,
          }
        )
        video.play()
      }

      /**
       * Adjust the lightbox height to fit the video
       */
      const aspectRatio = video.videoHeight / video.videoWidth
      this.$emit("load", {
        height: aspectRatio * this.dimensions.width,
        currentTime,
      })
    },
    updateVideoProgress() {
      const video = this.$refs.video
      if (video) {
        const amountViewed = video.currentTime / video.duration
        this.$emit("timeupdate", { amountViewed, currentTime: video.currentTime })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100vw;

  &.fullscreen {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
