<template>
  <div
    :id="`kaltura-container-${node.id}`"
    ref="kalturaContainer"
    :class="['kaltura-video-container', { fullscreen: node.fullscreen }]"
  ></div>
</template>

<script>
// Prevent linter warning on use of kWidget variable
/*global kWidget*/

import client from "@/services/TapestryAPI"

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
      onLoad: true,
      playerId: "",
      amountViewed: 0,
    }
  },
  computed: {
    kalturaId() {
      return this.node.typeData.kalturaId
    },
  },
  watch: {
    playing() {
      if (this.playing && this.playerId) {
        const kalturaVideo = document.getElementById(this.playerId)
        if (this.onLoad) {
          const videoDuration = kalturaVideo.evaluate("{duration}")
          const currentTime = this.node.progress * videoDuration

          this.$emit("timeupdate", {
            amountViewed: this.node.progress,
            currentTime,
          })

          kalturaVideo.sendNotification("doSeek", currentTime)
          this.lastTime = currentTime
          this.onLoad = false
        }
      }
    },
  },
  created() {
    const kalturaScript = document.createElement("script")
    const partnerId = this.node.typeData.kalturaData.partnerId
    const serviceUrl = this.node.typeData.kalturaData.serviceUrl
    const uniqueConfiguration = this.node.typeData.kalturaData.uniqueConfiguration
    kalturaScript.src = `${serviceUrl}/p/${partnerId}/sp/${partnerId}00/embedIframeJs/uiconf_id/${uniqueConfiguration}/partner_id/${partnerId}`

    kalturaScript.id = "kaltura-script"

    kalturaScript.addEventListener("load", () => {
      kWidget.embed({
        targetId: `kaltura-container-${this.node.id}`,
        wid: `_${partnerId}`,
        uiconf_id: uniqueConfiguration,
        entry_id: this.kalturaId,
        flashvars: {
          autoPlay: this.autoplay,
          autoPlayFallbackToMute: false,
          "unMuteOverlayButton.plugin": false,
        },
      })

      const kalturaIframe = document.querySelector(
        `#kaltura-container-${this.node.id} > iframe`
      )
      kalturaIframe.style.minHeight = "0"

      kalturaIframe.onload = () => {
        kWidget.addReadyCallback(playerId => {
          this.playerId = playerId
          const kalturaVideo = document.getElementById(playerId)

          kalturaVideo.kBind("playerUpdatePlayhead", currentTime => {
            const videoDuration = kalturaVideo.evaluate("{duration}")
            this.updateVideoProgress(currentTime, videoDuration)
          })

          kalturaVideo.kBind("playerPaused", () => {
            if (this.amountViewed < 0.99) {
              this.$emit("pause")
              client.recordAnalyticsEvent(
                "user",
                "pause",
                "kaltura-video",
                this.node.id,
                {
                  time: kalturaVideo.evaluate("{utility.timestamp}"),
                }
              )
            }
          })

          kalturaVideo.kBind("playbackComplete", () => {
            const videoDuration = kalturaVideo.evaluate("{duration}")
            this.updateVideoProgress(videoDuration, videoDuration)
          })

          kalturaVideo.kBind("playerPlayed", () => {
            this.$emit("play")
            client.recordAnalyticsEvent(
              "user",
              "play",
              "kaltura-video",
              this.node.id,
              {
                time: kalturaVideo.evaluate("{utility.timestamp}"),
              }
            )
          })

          kalturaVideo.kBind("seeked", seekedTime => {
            this.$emit("seeked", { currentTime: seekedTime })
          })

          kalturaVideo.kBind("closeFullScreen", () => {
            kalturaIframe.contentDocument.getElementsByClassName(
              "mwPlayerContainer"
            )[0].style.height = "100%"
          })

          const nodeProgress = this.node.progress
          const videoDuration = kalturaVideo.evaluate("{duration}")
          const currentTime = nodeProgress * videoDuration
          this.$emit("load", { currentTime, type: "kaltura-video" })
        })
      }
    })

    document.head.appendChild(kalturaScript)
  },
  beforeDestroy() {
    const kalturaScript = document.getElementById("kaltura-script")
    document.head.removeChild(kalturaScript)
  },
  methods: {
    updateVideoProgress(currentTime, duration) {
      this.amountViewed = currentTime / duration
      this.$emit("timeupdate", { amountViewed: this.amountViewed, currentTime })
      this.lastTime = currentTime
    },
    playVideo() {
      if (this.playerId) {
        const kalturaVideo = document.getElementById(this.playerId)
        kalturaVideo.sendNotification("doPlay")
      }
    },
    pauseVideo() {
      if (this.playerId) {
        const kalturaVideo = document.getElementById(this.playerId)
        kalturaVideo.sendNotification("doPause")
      }
    },
    reset() {
      this.onLoad = false
      const kalturaVideo = document.getElementById(this.playerId)
      this.updateVideoProgress(0, kalturaVideo.evaluate("{duration}"))
      kalturaVideo.sendNotification("doSeek", 0)
      this.$emit("timeupdate", { amountViewed: this.amountViewed, currentTime: 0 })
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
