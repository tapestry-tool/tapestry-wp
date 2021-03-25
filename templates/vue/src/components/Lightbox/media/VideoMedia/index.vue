<template>
  <div>
    <component
      :is="videoComponent"
      v-show="activePopupId === null"
      ref="video"
      :node="node"
      v-bind="$attrs"
      v-on="$listeners"
      @timeupdate="checkAndShowPopup"
    />
    <tapestry-media
      v-if="activePopupId != null"
      :dimensions="$attrs.dimensions"
      :node-id="activePopupId"
      @complete="isPopupComplete = true"
    />
    <button v-if="isPopupComplete" @click="resume">
      Continue
    </button>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import UrlVideoMedia from "./UrlVideoMedia"
import H5PMedia from "./H5PMedia"
import YouTubeMedia from "./YouTubeMedia"

export default {
  components: {
    TapestryMedia: () => import("../TapestryMedia"),
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
  data() {
    return {
      activePopupId: null,
      isPopupComplete: false,
    }
  },
  computed: {
    ...mapGetters(["getNode", "getDirectChildren"]),
    videoComponent() {
      switch (this.node.mediaFormat) {
        case "mp4":
          return "url-video-media"
        case "youtube":
          return "youtube-media"
        case "h5p":
          return "h5p-media"
        default:
          throw new Error(`Unknown video type: ${this.node.mediaFormat}`)
      }
    },
    popups() {
      const popups = this.getDirectChildren(this.node.id)
        .map(this.getNode)
        .filter(child => child.popup != null)
        .map(child => ({ time: child.popup.time, id: child.id }))
      popups.sort((a, b) => a.time - b.time)
      return popups
    },
  },
  watch: {
    /**
     * The `timeupdate` event doesn't trigger at every ms, so it's possible a popup
     * time is between two timeupdate calls. To compensate, we need to keep track of
     * a `lastTime` which corresponds to the last time the `timeupdate` event
     * triggered. Every time a `timeupdate` triggers, we check if there is a popup
     * between the current time and the last time.
     *
     * As a consequence, we have to reset the `lastTime` every time the node
     * changes, so `lastTime` is always <= the current time.
     */
    node: {
      immediate: true,
      handler() {
        this.lastTime = 0
      },
    },
  },
  methods: {
    checkAndShowPopup({ amountViewed, currentTime }) {
      console.log(currentTime)
      const activePopup = this.popups.find(
        popup => popup.time >= this.lastTime && popup.time <= currentTime
      )

      if (activePopup) {
        this.activePopupId = activePopup.id
        this.$refs.video.pause()
      }

      this.lastTime = currentTime
      this.$emit("timeupdate", { amountViewed, currentTime })
    },
    resume() {
      this.activePopupId = null
      this.isPopupComplete = false
      this.$refs.video.play()
    },
  },
}
</script>

<style scoped>
div {
  height: 100%;
}
</style>
