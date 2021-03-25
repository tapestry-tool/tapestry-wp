<template>
  <div>
    <component :is="videoComponent" :node="node" v-bind="$attrs" v-on="$listeners" />
  </div>
</template>

<script>
import UrlVideoMedia from "./UrlVideoMedia"
import H5PMedia from "./H5PMedia"
import YouTubeMedia from "./YouTubeMedia"

export default {
  components: {
    UrlVideoMedia,
    "youtube-media": YouTubeMedia,
    "h5p-media": H5PMedia,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  computed: {
    videoComponent() {
      switch (this.node.mediaFormat) {
        case "mp4":
          return "url-video-media"
        case "youtube":
          return "youtube-media"
        case "h5p":
          return "h5p-media"
        default:
          console.error(`Unknown video type: ${this.node.mediaFormat}`)
          return ""
      }
    },
  },
}
</script>

<style scoped>
div {
  height: 100%;
}
</style>
