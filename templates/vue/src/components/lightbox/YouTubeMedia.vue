<template>
  <div>
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
      :player-vars="{
        autoplay: autoplay,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        enablejsapi: 1,
      }"
      class="video-container"
      @ready="ready"
      @paused="handlePause(player.getCurrentTime())"
      @ended="handleEnd"
    />
  </div>
</template>

<script>
import EndScreen from "./EndScreen"
import QuizScreen from "./QuizScreen"
import { mapState, mapActions } from "vuex"
import Helpers from "../../utils/Helpers"
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
    allowEndScreen: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      showEndScreen: this.getInitialEndScreenState() && this.allowEndScreen,
      showQuizScreen: false,
      videoDimensions: null,
      player: null,
    }
  },
  computed: {
    ...mapState(["h5pSettings"]),
  },
  beforeDestroy() {
    if (this.player) {
      const time = this.player.getCurrentTime()
      this.player.stopVideo()
      this.updateVideoProgress(time)
      this.updateSettings()
    }
  },
  methods: {
    ...mapActions(["updateH5pSettings"]),
    ready(event) {
      this.player = event.target
      const startTime =
        this.node.typeData.progress[0].value * this.node.mediaDuration
      this.player.seekTo(startTime, true)
      this.applySettings()
    },
    openQuiz() {
      this.showEndScreen = false && this.allowEndScreen
      this.showQuizScreen = true
    },
    back() {
      this.showEndScreen = true && this.allowEndScreen
      this.showQuizScreen = false
    },
    rewatch() {
      this.showEndScreen = false && this.allowEndScreen
      if (this.player) {
        this.player.seekTo(0, true)
        this.player.playVideo()
      }
    },
    close() {
      if (this.player) {
        this.player.stopVideo()
        this.updateVideoProgress()
        this.updateSettings()
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
        const amountViewed = currentTime / this.player.getDuration()
        this.$emit("timeupdate", amountViewed)
        if (amountViewed >= ALLOW_SKIP_THRESHOLD) {
          this.$emit("complete")
        }
        if (amountViewed >= 1) {
          this.showEndScreen = true
        }
      }
    },
    handlePause(time) {
      this.updateVideoProgress(time)
      this.updateSettings()
    },
    handleEnd() {
      this.updateVideoProgress(this.node.mediaDuration) // Pass update with video duration because video may be a few milliseconds short
      this.updateSettings()
      this.showEndScreen = true
    },
    applySettings() {
      if (!this.h5pSettings || Object.keys(this.h5pSettings).length === 0) return
      this.h5pSettings.muted ? this.player.mute() : this.player.unMute()
      this.h5pSettings.volume
        ? this.player.setVolume(this.h5pSettings.volume)
        : false
      this.h5pSettings.playbackRate
        ? this.player.setPlaybackRate(this.h5pSettings.playbackRate)
        : false
    },
    updateSettings() {
      const newSettings = { ...this.h5pSettings }
      newSettings.muted = this.player.isMuted()
      newSettings.volume = this.player.getVolume()
      newSettings.playbackRate = this.player.getPlaybackRate()
      if (Helpers.isDifferent(this.h5pSettings, newSettings)) {
        this.updateH5pSettings(newSettings)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.video-container {
  border-radius: 15px;
  position: absolute;
  top: 15px;
  width: 100%;
  height: 100%;
  max-width: 100vw;
  overflow: hidden;
  > div {
    padding-right: 30px;
    > iframe {
      margin: 0;
      padding: 0;
    }
  }
}

.end-screen {
  border-radius: 12px;
}
</style>
