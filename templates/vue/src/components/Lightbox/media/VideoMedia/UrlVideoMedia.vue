<template>
  <div :class="['video-container', { fullscreen: node.fullscreen }]">
    <video
      ref="video"
      controls
      :autoplay="autoplay"
      :src="node.typeData.mediaURL"
      :style="videoStyles"
      preload="metadata"
      @loadeddata="handleLoad"
      @play="handlePlay"
      @pause="handlePause"
      @seeked="handleSeek"
      @seeking="$emit('seeking')"
      @timeupdate="updateVideoProgress"
    ></video>
    <play-screen v-if="!videoPlaying" class="screen" @play="playVideo" />
  </div>
</template>

<script>
import client from "@/services/TapestryAPI"
import { SEEK_THRESHOLD } from "./video.config"
import PlayScreen from "./PlayScreen"

export default {
  name: "url-video-media",
  components: {
    PlayScreen,
  },
  props: {
    node: {
      type: Object,
      required: true,
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
    autoplay: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      videoDimensions: null,
      videoPlaying: false,
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
    playing() {
      const video = this.$refs.video
      if (video) {
        this.videoPlaying = !video.paused
      }
    },
  },
  beforeDestroy() {
    this.updateVideoProgress()
  },
  methods: {
    playVideo() {
      const video = this.$refs.video
      if (video) {
        video.play()
      }
    },
    pauseVideo() {
      const video = this.$refs.video
      if (video) {
        video.pause()
      }
    },
    handleSeek($event) {
      this.$emit("seeked", { currentTime: $event.srcElement.currentTime })
    },
    reset() {
      this.$refs.video.currentTime = 0
    },
    handlePlay($event) {
      this.videoPlaying = true
      this.$emit("play")
      client.recordAnalyticsEvent("user", "play", "html5-video", this.node.id, {
        time: $event.srcElement.currentTime,
      })
    },
    handlePause($event) {
      this.$emit("pause")
      client.recordAnalyticsEvent("user", "pause", "html5-video", this.node.id, {
        time: $event.srcElement.currentTime,
      })
    },
    handleLoad($event) {
      const video = $event.srcElement
      this.videoDimensions = {
        height: video.videoHeight,
        width: video.videoWidth,
      }
      const currentTime = this.node.progress * video.duration
      video.currentTime = currentTime
      this.lastTime = currentTime

      this.videoPlaying = !video.paused

      /**
       * Adjust the lightbox height to fit the video
       */
      this.$emit("load", {
        width: this.videoDimensions.width,
        height: this.videoDimensions.height,
        type: "html5-video",
        currentTime,
      })
    },
    updateVideoProgress($event) {
      const video = $event?.srcElement || this.$refs.video
      if (video) {
        const currentTime = video.currentTime
        const amountViewed = currentTime / video.duration
        if (Math.abs(currentTime - this.lastTime) > SEEK_THRESHOLD) {
          this.$emit("seeked", { currentTime })
        } else {
          this.$emit("timeupdate", { amountViewed, currentTime })
        }
        this.lastTime = currentTime
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
  display: flex;

  &.fullscreen {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
