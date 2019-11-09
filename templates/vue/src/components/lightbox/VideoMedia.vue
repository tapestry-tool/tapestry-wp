<template>
  <div class="container">
    <div
      :class="[
        'end-screen',
        {
          'end-screen--hide': !showEndScreen,
        },
      ]"
    >
      <button class="end-screen-button" @click="rewatch">
        <i class="fas fa-redo fa-4x"></i>
        <p class="end-screen-button-text">Rewatch</p>
      </button>
      <button class="end-screen-button" @click="close">
        <i class="far fa-times-circle fa-4x"></i>
        <p class="end-screen-button-text">Close</p>
      </button>
    </div>
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
.end-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  color: black;
  opacity: 1;
  transition: opacity 0.4s ease-out;
  z-index: 10;
}

.end-screen--hide {
  opacity: 0;
  pointer-events: none;
}

.end-screen-button {
  background: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: inherit;
  margin-right: 3em;
}

.end-screen-button:last-child {
  margin-right: 0;
}

.end-screen-button:hover {
  color: #11a6d8;
}

.end-screen-button-text {
  margin: 0;
  padding: 0;
  font-weight: 600;
  margin-top: 1em;
}

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
