<template>
  <div class="container">
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
    <loading v-if="isLoading" label="Loading H5P media..." />
    <h5p-iframe
      ref="h5pIframe"
      :autoplay="autoplay"
      :dimensions="dimensions"
      :node="node"
      :settings="settings"
      @complete="$emit('complete')"
      @is-loaded="handleLoad"
      @timeupdate="$emit('timeupdate', $event)"
      @show-end-screen="showEndScreen = true"
    />
  </div>
</template>

<script>
import Loading from "../Loading"
import EndScreen from "./EndScreen"
import PlayScreen from "./PlayScreen"
import H5PIframe from "./H5PIframe"
import QuizScreen from "./QuizScreen"

export default {
  name: "h5p-media",
  components: {
    EndScreen,
    "h5p-iframe": H5PIframe,
    Loading,
    QuizScreen,
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
    },
    settings: {
      type: Object,
      required: true,
    },
    autoplay: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      isLoading: true,
      showEndScreen: false,
      showQuizScreen: false,
      showPlayScreen: !this.autoplay,
    }
  },
  methods: {
    openQuiz() {
      this.showEndScreen = false
      this.showQuizScreen = true
    },
    rewatch() {
      this.showEndScreen = false
      this.$refs.h5pIframe.rewatch()
    },
    close() {
      this.showEndScreen = false
      this.$refs.h5pIframe.close()
      this.$emit("close")
    },
    back() {
      this.showQuizScreen = false
      this.showEndScreen = true
    },
    play() {
      this.showPlayScreen = false
      this.$refs.h5pIframe.play()
    },
    handleLoad() {
      this.isLoading = false
      this.$emit("load")
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
  padding: 0;
}
</style>
