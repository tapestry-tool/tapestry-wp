<template>
  <div class="container">
    <end-screen
      v-if="showEndScreen && !readOnly"
      :node="node"
      @rewatch="rewatch"
      @close="close"
      @show-quiz="openQuiz"
    />
    <quiz-screen
      v-else-if="showQuizScreen"
      :id="node.id"
      :read-only="readOnly"
      @back="back"
      @close="close"
    />
    <loading v-if="isLoading" label="Loading H5P media..." />
    <h5p-iframe
      ref="h5pIframe"
      :autoplay="autoplay"
      :dimensions="dimensions"
      :node="node"
      :read-only="readOnly"
      :settings="h5pSettings"
      @complete="$emit('complete')"
      @change:dimensions="$emit('change:dimensions', $event)"
      @is-loaded="handleLoad"
      @timeupdate="$emit('timeupdate', $event)"
      @show-end-screen="showEndScreen = allowEndScreen"
      @show-play-screen="showPlayScreen = $event"
      @update-settings="updateSettings"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex"
import Loading from "../Loading"
import EndScreen from "./EndScreen"
import H5PIframe from "./H5PIframe"
import QuizScreen from "./QuizScreen"

export default {
  name: "h5p-media",
  components: {
    EndScreen,
    "h5p-iframe": H5PIframe,
    Loading,
    QuizScreen,
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
    allowEndScreen: {
      type: Boolean,
      required: false,
      default: true,
    },
    autoplay: {
      type: Boolean,
      required: false,
      default: true,
    },
    readOnly: {
      type: Boolean,
      required: false,
      default: false,
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
  computed: {
    ...mapState(["h5pSettings"]),
  },
  methods: {
    ...mapActions(["updateH5pSettings"]),
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
    handleLoad() {
      this.isLoading = false
      this.$emit("load")
    },
    updateSettings(settings) {
      globals.recordAnalyticsEvent(
        "user",
        "update-settings",
        "h5p-video",
        this.node.id,
        { from: this.h5pSettings, to: settings }
      )
      this.updateH5pSettings(settings)
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  width: 100%;
  min-height: 100%;
  max-width: 100vw;
  padding: 0;
}
</style>
