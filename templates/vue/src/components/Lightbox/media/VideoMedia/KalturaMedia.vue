<template>
  <div
    id="kaltura-player"
    :class="['video-container', { fullscreen: node.fullscreen }]"
  ></div>
</template>

<script>
import client from "@/services/TapestryAPI"
import { SEEK_THRESHOLD } from "./video.config"

export default {
  name: "kaltura-video-media",
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
  created() {
    let kalturaScript = document.createElement("script")
    kalturaScript.setAttribute(
      "src",
      `https://admin.video.ubc.ca/p/163/sp/16300/embedIframeJs/uiconf_id/23449696/partner_id/163`
    )

    kalturaScript.onload = () =>
      kWidget.embed({
        targetId: "kaltura-player",
        wid: "_163",
        uiconf_id: 23449696,
        flashvars: {},
        cache_st: 1629228387,
        entry_id: "0_wt4lq7kb",
      })

    document.head.appendChild(kalturaScript)

    this.$emit("load")
  },
  beforeDestroy() {
    this.updateVideoProgress()
  },
  methods: {
    handleSeek() {
      this.$emit("seeked", { currentTime: this.$refs.video.currentTime })
    },
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
      this.lastTime = currentTime

      /**
       * Adjust the lightbox height to fit the video
       */
      this.$emit("load", {
        width: this.dimensions.width,
        height: this.dimensions.height,
        type: "html5-video",
        currentTime,
      })
    },
    handleError() {
      // Error code 4 - The associated resource or media provider object has been found to be unsuitable.
      if (this.$refs.video.error.code === 4) {
        if (
          confirm(
            "It seems this video cannot be load, would you like to refresh the page?"
          )
        ) {
          location.reload()
        }
      }
    },
    updateVideoProgress() {
      const video = this.$refs.video
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
    mounted() {
      const video = this.$refs.video
      if (this.autoplay) {
        video.play()
      } else {
        video.pause()
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
