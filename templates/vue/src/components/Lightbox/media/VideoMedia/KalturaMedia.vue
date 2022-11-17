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
  name: "kaltura-media",
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
    context: {
      type: String,
      required: false,
      default: "lightbox",
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
      playerId: "",
      amountViewed: 0,
    }
  },
  computed: {
    kalturaId() {
      return this.node.typeData.kalturaId
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

          if (this.context === "multi-content") {
            this.setFrameDimensions()
            window.addEventListener("resize", this.setFrameDimensions)
          }

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

          kalturaVideo.kBind("userInitiatedSeek", seekedTime => {
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

          try {
            kalturaVideo.sendNotification("doSeek", currentTime)
          } catch (e) {
            try {
              kalturaVideo.kBind("mediaReady", function() {
                kalturaVideo.sendNotification("doSeek", currentTime)
              })
            } catch (e) {
              console.log("Kaltura player could not seek")
            }
          }

          this.$emit("load", { currentTime, type: "kaltura-video" })
        })
      }
    })

    document.head.appendChild(kalturaScript)
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.setFrameDimensions)
    const kalturaScript = document.getElementById("kaltura-script")
    document.head.removeChild(kalturaScript)
  },
  methods: {
    updateVideoProgress(currentTime, duration) {
      this.amountViewed = currentTime / duration
      this.$emit("timeupdate", { amountViewed: this.amountViewed, currentTime })
      this.lastTime = currentTime
    },
    setFrameDimensions() {
      const kalturaPlayerBarHeight = 36

      const kalturaVideo = document.getElementById(this.playerId)

      const fitHeight = window.innerHeight
      const playerWidth = kalturaVideo.evaluate("{video.player.width}")
      const entry = kalturaVideo.evaluate("{mediaProxy.entry}")

      if (entry) {
        // Proportionally make the frame smaller
        let scaleFactor = fitHeight / entry.height
        this.frameHeight = entry.height * scaleFactor + kalturaPlayerBarHeight
        this.frameWidth = entry.width * scaleFactor
        // if the width is bigger than the available space, we need to scale based on the width
        if (this.frameWidth > playerWidth) {
          scaleFactor = playerWidth / entry.width
          this.frameHeight = entry.height * scaleFactor + kalturaPlayerBarHeight
          this.frameWidth = entry.width * scaleFactor
        }

        this.$emit("change:dimensions", {
          width: this.frameWidth,
          height: this.frameHeight,
        })
      }
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
      if (this.playerId) {
        const kalturaVideo = document.getElementById(this.playerId)
        this.updateVideoProgress(0, kalturaVideo.evaluate("{duration}"))
        kalturaVideo.sendNotification("doSeek", 0)
        this.$emit("timeupdate", { amountViewed: this.amountViewed, currentTime: 0 })
      }
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
