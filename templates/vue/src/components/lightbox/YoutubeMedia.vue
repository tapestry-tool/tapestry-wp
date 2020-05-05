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
      :video-id="node.typeData.youtubeID"
      :player-width="dimensions.width - 15"
      :player-height="dimensions.height - 40"
      :player-vars="{autoplay: autoplay, modestbranding: 1, rel: 0, iv_load_policy: 3}"
      @ready="ready"
      @paused="handlePause(player.getCurrentTime())"
      @ended="handleEnd"
    />
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
      showEndScreen: this.getInitialEndScreenState(),
      showQuizScreen: false,
      videoDimensions: null,
      player: null,
    }
  },
  beforeDestroy() {
    if (this.player) {
      const time = this.player.getCurrentTime()
      this.player.stopVideo()
      this.updateVideoProgress(time)
    }
  },
  methods: {
    ready(event){  
      this.player = event.target
      const startTime = this.node.typeData.progress[0].value * this.node.mediaDuration
      this.player.seekTo(startTime, true)
    },
    openQuiz() {
      this.showEndScreen = false
      this.showQuizScreen = true
    },
    back() {
      this.showEndScreen = true
      this.showQuizScreen = false
    },
    rewatch() {
      this.showEndScreen = false
      if (this.player) {
        this.player.seekTo(0, true)
        this.player.playVideo()
      }
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
        const viewedAmount = progress * this.player.getDuration()
        return this.player.getDuration() <= viewedAmount
      }
      return false
    },
    updateVideoProgress(time) {
      if (this.player) {
        const currentTime = time || this.player.getCurrentTime()
        console.log(currentTime)
        const amountViewed = currentTime / this.player.getDuration()
        this.$emit("timeupdate", amountViewed)

        if (amountViewed >= ALLOW_SKIP_THRESHOLD) {
          console.log("complete")
          this.$emit("complete")
        }
        if (amountViewed >= 1) {
          this.showEndScreen = true
        }
      }
    },
    handlePause(time){
      this.updateVideoProgress(time)
    },
    handleEnd(){
      this.updateVideoProgress(this.node.mediaDuration) // Pass update with video duration because video may be a few milliseconds short
      this.showEndScreen = true
    }
  },
}
</script>

<style lang="scss" scoped>
.video-container {
  position: absolute;
  left: 15px;
  top: 15px;
  width: 100%;
  height: 100%;
  max-width: 100vw;

  > div {
    padding-right: 30px;

    > iframe {
    margin: 0;
    padding: 0;
    }
  }
}
</style>
