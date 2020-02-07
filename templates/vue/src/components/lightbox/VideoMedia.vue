<template>
  <div class="container">
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
      autoplay
      :src="node.typeData.mediaURL"
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

const ALLOW_SKIP_THRESHOLD = 0.95

export default {
  name: "video-media",
  components: {
    EndScreen,
    QuizScreen,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showEndScreen: this.getInitialEndScreenState(),
      showQuizScreen: false,
    }
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
    rewatch() {
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
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100vw;

  video {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: auto;
  }
}
</style>
