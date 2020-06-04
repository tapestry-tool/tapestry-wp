<template>
  <div :class="['video-container', { fullscreen: node.fullscreen }]">
    <play-screen v-if="showPlayScreen" @play="play" />
    <end-screen
      v-if="showEndScreen"
      :node="node"
      @rewatch="rewatch"
      @close="close"
      @show-quiz="openQuiz"
    />
    <quiz-screen
      v-else-if="showQuizScreen"
      :id="node.id"
      @back="back"
      @close="close"
    />
    <video
      ref="video"
      controls
      :autoplay="autoplay"
      :src="node.typeData.mediaURL"
      :style="videoStyles"
      @loadeddata="handleLoad"
      @play="handlePlay(node)"
      @pause="handlePause(node)"
      @timeupdate="updateVideoProgress"
    ></video>
  </div>
</template>

<script>
import EndScreen from "./EndScreen"
import QuizScreen from "./QuizScreen"
import PlayScreen from "./PlayScreen"

const ALLOW_SKIP_THRESHOLD = 0.95

export default {
  name: "video-media",
  components: {
    EndScreen,
    QuizScreen,
    PlayScreen,
  },
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
  },
  data() {
    return {
      showPlayScreen: !this.autoplay,
      showEndScreen: this.getInitialEndScreenState(),
      showQuizScreen: false,
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
    node(newNode, oldNode) {
      this.handlePause(oldNode)
      this.handleLoad()
    },
  },
  beforeDestroy() {
    if (this.$refs.video) {
      this.$refs.video.pause()
      this.updateVideoProgress()
    }
  },
  methods: {
    openQuiz() {
      this.showEndScreen = false
      this.showQuizScreen = true
    },
    play() {
      if (this.$refs.video) {
        this.$refs.video.play()
      }
    },
    rewatch() {
      this.showPlayScreen = false
      this.showEndScreen = false
      if (this.$refs.video) {
        this.$refs.video.currentTime = 0
        this.$refs.video.play()
      }
    },
    back() {
      this.showEndScreen = true
      this.showQuizScreen = false
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
    handlePlay(node) {
      this.showPlayScreen = false
      this.showEndScreen = false
      const { id, mediaType } = node
      thisTapestryTool.updateMediaIcon(id, mediaType, "pause")
      const video = this.$refs.video
      if (video) {
        thisTapestryTool.recordAnalyticsEvent("user", "play", "html5-video", id, {
          time: video.currentTime,
        })
      }
    },
    handlePause(node) {
      this.showPlayScreen = true
      const { id, mediaType } = node
      thisTapestryTool.updateMediaIcon(id, mediaType, "play")
      const video = this.$refs.video
      if (video) {
        thisTapestryTool.recordAnalyticsEvent("user", "pause", "html5-video", id, {
          time: video.currentTime,
        })
      }
    },
    handleLoad() {
      const video = this.$refs.video
      this.videoDimensions = {
        height: video.videoHeight,
        width: video.videoWidth,
      }
      this.updateDimensions()
      this.seek()
    },
    seek() {
      const video = this.$refs.video
      if (video) {
        const progress = this.node.typeData.progress[0].value
        const viewedAmount = progress * video.duration
        video.currentTime = viewedAmount
      }
    },
    updateDimensions() {
      const video = this.$refs.video
      if (video) {
        const videoRect = this.$refs.video.getBoundingClientRect()
        this.$emit("load", {
          width: videoRect.width,
          height: videoRect.height,
          el: this.$refs.video,
        })
      }
    },
    updateVideoProgress() {
      const video = this.$refs.video
      if (video) {
        const amountViewed = video.currentTime / video.duration
        this.$emit("timeupdate", amountViewed)

        if (amountViewed >= ALLOW_SKIP_THRESHOLD) {
          this.$emit("complete")
        }
        if (amountViewed >= 1) {
          this.showEndScreen = true
        }
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
