<template>
  <div class="container">
    <end-screen :node="node" :show="showEndScreen" @rewatch="rewatch" @close="close" />
    <loading v-if="isLoading" label="Loading H5P media..." />
    <h5p-iframe
      :node="node"
      :width="width"
      :height="height"
      :settings="settings"
      @show-end-screen="showEndScreen = true"
    />
  </div>
</template>

<script>
import Loading from "../Loading"
import EndScreen from "./EndScreen"
import H5PIframe from "./H5PIframe"

const ALLOW_SKIP_THRESHOLD = 0.95

export default {
  name: "h5p-media",
  components: {
    EndScreen,
    'h5p-iframe': H5PIframe,
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
      const h5pObj = this.$refs.h5p.contentWindow.H5P
      const h5pVideo = h5pObj.instances[0].video
      h5pVideo.seek(0)
      h5pVideo.play()
    },
    close() {
      this.showEndScreen = false
      const h5pObj = this.$refs.h5p.contentWindow.H5P
      const h5pVideo = h5pObj.instances[0].video
      if (h5pVideo) {
        h5pVideo.pause()
      }
      this.$emit("close")
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
