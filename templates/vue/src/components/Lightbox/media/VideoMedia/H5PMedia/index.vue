<template>
  <div class="container">
    <loading v-if="isLoading" label="Loading H5P media..." />
    <h5p-iframe
      ref="h5pIframe"
      :playing="playing"
      :dimensions="dimensions"
      :node="node"
      :context="context"
      :settings="h5pSettings"
      @complete="$emit('complete')"
      @play="$emit('play')"
      @pause="$emit('pause')"
      @seeking="$emit('seeking')"
      @seeked="$emit('seeked', $event)"
      @change:dimensions="$emit('change:dimensions', $event)"
      @load="handleLoad"
      @timeupdate="$emit('timeupdate', $event)"
      @update-settings="updateSettings"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex"
import client from "@/services/TapestryAPI"
import Loading from "@/components/common/Loading"
import H5PIframe from "./H5PIframe"

export default {
  name: "h5p-media",
  components: {
    "h5p-iframe": H5PIframe,
    Loading,
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
    playing: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      isLoading: true,
    }
  },
  computed: {
    ...mapState(["h5pSettings"]),
  },
  methods: {
    ...mapActions(["updateH5pSettings"]),
    reset() {
      this.$refs.h5pIframe.reset()
    },
    handleLoad(evt) {
      this.isLoading = false
      this.$emit("load", evt)
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
}
</style>
