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
      @error="handleError"
    ></video>
    <play-screen v-if="!videoPlaying" class="screen" @play="playVideo" />
  </div>
</template>

<script>
import { mapMutations } from "vuex"
import client from "@/services/TapestryAPI"
import { SEEK_THRESHOLD } from "./video.config"
import PlayScreen from "./PlayScreen"
import { mapState } from "vuex"

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
    ...mapState(["browserDimensions"]),
    videoStyles() {
      if (!this.videoDimensions) {
        return { width: "100%" }
      }
      const { height, width } = this.videoDimensions
      const aspectRatio = width / height
      if (aspectRatio <= 1) {
        return { height: "100%", width: "auto" }
      }

      /**
       * If the video is full screen, we want to fit it into the window based on its
       * aspect ratio.
       */
      if (this.node.fullscreen && this.node.fitWindow) {
        const windowAspectRatio =
          this.browserDimensions.width / this.browserDimensions.height
        if (aspectRatio < windowAspectRatio) {
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
    ...mapMutations(["updateNode"]),
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
      const aspectRatio = this.videoDimensions.width / this.videoDimensions.height
      let fitDimensions = {
        width: this.dimensions.width,
        height: this.dimensions.height,
      }
      if (this.dimensions.height * aspectRatio > this.dimensions.width) {
        fitDimensions.height = this.dimensions.width / aspectRatio
      } else {
        fitDimensions.width = this.dimensions.height * aspectRatio
      }
      this.$emit("load", {
        width: fitDimensions.width,
        height: fitDimensions.height,
        type: "html5-video",
        currentTime,
      })
    },
    async handleError() {
      // If an error occurs loading the video, first try to re-fetch the video URL from the backend
      // Only alert user if this is unsuccessful
      const fetchedNode = await client.getNode(this.node.id)
      if (fetchedNode.typeData.mediaURL !== this.node.typeData.mediaURL) {
        this.updateNode({
          id: this.node.id,
          newNode: fetchedNode,
        })
      } else if (
        confirm(
          "It seems this video cannot be loaded, would you like to refresh the page?"
        )
      ) {
        location.reload()
      }
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
