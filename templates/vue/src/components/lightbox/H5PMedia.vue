<template>
  <div class="container">
    <end-screen
      :node="node"
      :show="showEndScreen"
      @rewatch="rewatch"
      @close="close"
    />
    <loading v-if="isLoading" label="Loading H5P media..." />
    <h5p-iframe
      ref="h5pIframe"
      :node="node"
      :width="width"
      :height="height"
      :settings="settings"
      @complete="$emit('complete')"
      @is-loaded="handleLoad"
      @show-end-screen="showEndScreen = allowEndScreen"
    />
  </div>
</template>

<script>
import Loading from "../Loading"
import EndScreen from "./EndScreen"
import H5PIframe from "./H5PIframe"

export default {
  name: "h5p-media",
  components: {
    EndScreen,
    "h5p-iframe": H5PIframe,
    Loading,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    settings: {
      type: Object,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    allowEndScreen: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      isLoading: true,
      showEndScreen: false,
    }
  },
  methods: {
    rewatch() {
      this.showEndScreen = false
      this.$refs.h5pIframe.rewatch()
    },
    close() {
      this.showEndScreen = false
      this.$refs.h5pIframe.close()
      this.$emit("close")
    },
    handleLoad() {
      this.isLoading = false
      this.$emit("load", { el: this.$refs.h5pIframe })
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
