<template>
  <div class="h5p-media">
    <end-screen
      v-if="showEndScreen && !readOnly"
      :node="node"
      @rewatch="rewatch"
      @close="close"
      @show-quiz="openQuiz"
    />
    <activity-screen
      v-else-if="showActivityScreen"
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
      :context="context"
      :settings="h5pSettings"
      @complete="$emit('complete')"
      @change:dimensions="$emit('change:dimensions', $event)"
      @is-loaded="handleLoad"
      @timeupdate="$emit('timeupdate', $event)"
      @show-end-screen="showEndScreen = allowEndScreen"
      @update-settings="updateSettings"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex"
import Loading from "@/components/common/Loading"
import EndScreen from "../common/EndScreen"
import H5PIframe from "./H5PIframe"
import ActivityScreen from "../common/ActivityScreen"
import client from "@/services/TapestryAPI"

export default {
  name: "h5p-media",
  components: {
    EndScreen,
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
    allowEndScreen: {
      type: Boolean,
      required: false,
      default: true,
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
      showActivityScreen: false,
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
    handleLoad() {
      this.isLoading = false
      this.$emit("load")
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
.h5p-media {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100vw;
  padding: 0;
}
</style>
