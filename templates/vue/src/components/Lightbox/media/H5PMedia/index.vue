<template>
  <div class="container">
    <h1 v-if="showTitle" class="video-title">{{ node.title }}</h1>
    <loading v-if="isLoading" label="Loading H5P media..." />
    <play-screen
      v-if="showPlayScreen && !isLoading"
      class="play-screen"
      :hide-video="isYouTube"
      @play="handlePlay"
    />
    <end-screen
      v-if="showEndScreen"
      :node="node"
      @rewatch="rewatch"
      @close="close"
      @show-quiz="openQuiz"
    />
    <activity-screen
      v-else-if="showActivityScreen"
      :id="node.id"
      @back="back"
      @close="close"
    />
    <h5p-iframe
      ref="h5pIframe"
      :autoplay="autoplay"
      :dimensions="dimensions"
      :node="node"
      :context="context"
      :settings="h5pSettings"
      @complete="$emit('complete')"
      @change:dimensions="$emit('change:dimensions', $event)"
      @is-loaded="handleLoad($event)"
      @timeupdate="$emit('timeupdate', $event)"
      @show-end-screen="showEndScreen = true"
      @show-play-screen="showPlayScreen = $event"
      @update-settings="updateSettings"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex"
import client from "@/services/TapestryAPI"
import Loading from "@/components/common/Loading"
import PlayScreen from "../common/PlayScreen"
import EndScreen from "../common/EndScreen"
import H5PIframe from "./H5PIframe"
import ActivityScreen from "../common/ActivityScreen"

export default {
  name: "h5p-media",
  components: {
    EndScreen,
    PlayScreen,
    "h5p-iframe": H5PIframe,
    Loading,
    ActivityScreen,
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
    context: {
      type: String,
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
      isYouTube: false,
      showEndScreen: false,
      showActivityScreen: false,
      showPlayScreen: !this.autoplay,
    }
  },
  computed: {
    ...mapState(["h5pSettings"]),
    showTitle() {
      return this.context === "page" && this.node.typeData.showTitle !== false
    },
  },
  methods: {
    ...mapActions(["updateH5pSettings"]),
    openQuiz() {
      this.showEndScreen = false
      this.showActivityScreen = true
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
      this.showActivityScreen = false
      this.showEndScreen = true
    },
    handleLoad(h5p) {
      this.isLoading = false
      this.$emit("load")
      this.isYouTube = h5p.isYouTube
      if (h5p.library !== "H5P.InteractiveVideo") {
        this.showPlayScreen = false
      }
    },
    handlePlay() {
      this.showPlayScreen = false
      this.showEndScreen = false
      this.$refs.h5pIframe.play()
    },
    updateSettings(settings) {
      client.recordAnalyticsEvent(
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
  height: 100%;
  max-width: 100vw;
  padding: 0;

  .video-title {
    text-align: left;
    margin-bottom: 0.9em;
    font-weight: 500;
    font-size: 1.75rem;

    :before {
      display: none;
    }
  }

  .play-screen {
    margin-bottom: 37px;
    max-width: 100vw;
  }
}
</style>
