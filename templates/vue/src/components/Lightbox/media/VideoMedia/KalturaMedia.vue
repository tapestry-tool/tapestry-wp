<template>
  <div
    :id="`kaltura-container-${node.id}`"
    ref="kalturaContainer"
    :class="['kaltura-video-container', { fullscreen: node.fullscreen }]"
  ></div>
</template>

<script>
import client from "@/services/TapestryAPI"
import { SEEK_THRESHOLD } from "./video.config"
import { mapActions, mapState } from "vuex"
import { data as wpData } from "@/services/wp"

export default {
  name: "kaltura-video-media",
  props: {
    node: {
      type: Object,
      required: true,
    },
    dimensions: {
      type: Object,
      required: true,
      validator: val => {
        return ["width", "height"].every(prop => val.hasOwnProperty(prop))
      },
    },
    playing: {
      type: Boolean,
      required: true,
    },
    autoplay: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      videoDimensions: null,
      playerId: "",
    }
  },
  computed: {
    ...mapState(["kalturaStatus"]),
    kalturaData() {
      return this.node.typeData.kalturaData
    },
  },
  mounted() {
    kWidget.embed({
      targetId: `kaltura-container-${this.node.id}`,
      wid: `_${wpData.kaltura.kalturaPartnerId}`,
      uiconf_id: wpData.kaltura.uniqueConfiguration,
      entry_id: this.kalturaData.id,
    })

    kWidget.addReadyCallback(playerId => {
      this.playerId = playerId
      const kalturaVideo = document.getElementById(playerId)

      const kalturaIframe = document.querySelector(
        `#kaltura-container-${this.node.id} iframe`
      )
      kalturaIframe.style.minHeight = "0"

      const nodeProgress = this.node.progress
      const shoudAutoPlay = this.autoplay

      kalturaVideo.kBind("mediaReady", function() {
        const videoDuration = kalturaVideo.evaluate("{duration}")
        const currentTime = nodeProgress * videoDuration
        kalturaVideo.sendNotification("doSeek", currentTime)
        this.lastTime = currentTime

        if (shoudAutoPlay) {
          kalturaVideo.sendNotification("doPlay")
        }

        this.$emit("load", { currentTime, type: "kaltura-video" })
      })

      kalturaVideo.kBind("playerPaused", () => {
        this.$emit("pause")
        client.recordAnalyticsEvent("user", "pause", "kaltura-video", this.node.id, {
          time: kalturaVideo.evaluate("{utility.timestamp}"),
        })
      })

      kalturaVideo.kBind("playerPlayed", () => {
        this.$emit("play")
        client.recordAnalyticsEvent("user", "play", "kaltura-video", this.node.id, {
          time: kalturaVideo.evaluate("{utility.timestamp}"),
        })
      })

      kalturaVideo.kBind("playerUpdatePlayhead", currentTime => {
        const videoDuration = kalturaVideo.evaluate("{duration}")
        this.updateVideoProgress(currentTime, videoDuration)
      })

      this.$emit("load", { currentTime: 0 })
    })
  },
  beforeDestroy() {
    kWidget.destroy(`kaltura-container-${this.node.id}`)
  },
  methods: {
    ...mapActions(["fetchKalturaStatus"]),
    updateVideoProgress(currentTime, duration) {
      const amountViewed = currentTime / duration
      if (Math.abs(currentTime - this.lastTime) > SEEK_THRESHOLD) {
        this.$emit("seeked", { currentTime })
      } else {
        this.$emit("timeupdate", { amountViewed, currentTime })
      }
      this.lastTime = currentTime
    },
  },
}
</script>

<style lang="scss">
.kaltura-video-container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100vw;
  display: flex;
  opacity: 1 !important;

  &.fullscreen {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
