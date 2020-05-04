<template>
  <div class="video-container">
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
    <youtube 
      :video-id="youtubeId"
      :player-width="dimensions.width"
      :player-height="dimensions.height"
      :player-vars="{start: 0, autoplay: autoplay}"
      @ready="ready"
    />
  </div>
</template>

<script>
import EndScreen from "./EndScreen"
import QuizScreen from "./QuizScreen"

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
    youtubeId: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      showEndScreen: this.getInitialEndScreenState(),
      showQuizScreen: false,
      videoDimensions: null,
      currentTime: 0,
      player: null,
    }
  },
  watch: {
    node(newNode, oldNode) {
      this.handlePause(oldNode)
      this.handleLoad()
    },
  },
  beforeDestroy() {
    if (this.player) {
      this.player.stopVideo()
      this.updateVideoProgress()
    }
  },
  methods: {
    ready(event){ 
      this.player = event.target
    },
    openQuiz() {
      this.showEndScreen = false
      this.showQuizScreen = true
    },
    back() {
      this.showEndScreen = true
      this.showQuizScreen = false
    },
    close() {
      if (this.player) {
        this.player.stopVideo()
        this.updateVideoProgress()
      }
      this.$emit("close")
    },
    getInitialEndScreenState() {
      const progress = this.node.typeData.progress[0].value
      if (progress >= 1) {
        return true
      }
      if (this.player) {
        const viewedAmount = progress * this.node.mediaDuration
        return this.$refs.video.duration <= viewedAmount
      }
      return false
    },
    updateVideoProgress() {
      if (this.player) {
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
}
</style>
