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

import videoMediaMixins from "./_mixins.js"
import client from "@/services/TapestryAPI"
import { mapState, mapMutations } from "vuex"

export default {
  name: "kaltura-media",
  mixins: [videoMediaMixins],
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
    ...mapState(["kalturaScriptsLoaded"]),
    kalturaId() {
      return this.node.typeData.kalturaId
    },
  },
  mounted() {
    const partnerId = this.node.typeData.kalturaData.partnerId
    const serviceUrl = this.node.typeData.kalturaData.serviceUrl
    const uniqueConfiguration = this.node.typeData.kalturaData.uniqueConfiguration

    const kalturaScriptId = `tapestry-kaltura-script-${serviceUrl}-${partnerId}-${uniqueConfiguration}`

    let kalturaScript = document.getElementById(kalturaScriptId)

    if (this.kalturaScriptsLoaded.includes(kalturaScriptId)) {
      this.handleScriptLoaded(partnerId, uniqueConfiguration)
    } else if (kalturaScript) {
      kalturaScript.addEventListener("load", () => {
        this.addKalturaScriptLoaded(kalturaScriptId)
        this.handleScriptLoaded(partnerId, uniqueConfiguration)
      })
    } else {
      kalturaScript = document.createElement("script")
      kalturaScript.src = `${serviceUrl}/p/${partnerId}/sp/${partnerId}00/embedIframeJs/uiconf_id/${uniqueConfiguration}/partner_id/${partnerId}`
      kalturaScript.id = kalturaScriptId
      kalturaScript.addEventListener("load", () => {
        this.addKalturaScriptLoaded(kalturaScriptId)
        this.handleScriptLoaded(partnerId, uniqueConfiguration)
      })
      document.head.appendChild(kalturaScript)
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.setFrameDimensions)
  },
  methods: {
    ...mapMutations(["addKalturaScriptLoaded"]),
    handleScriptLoaded(partnerId, uniqueConfiguration) {
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
          const kalturaVideo = document.getElementById(playerId)
          if (!kalturaVideo.contains(kalturaIframe)) {
            return
          }
          this.playerId = playerId

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
              console.error("Kaltura player could not seek to its saved position", e)
            }
          }

          this.$emit("load", { currentTime, type: "kaltura-video" })
        })
      }
    },
    updateVideoProgress(currentTime, duration) {
      this.amountViewed = currentTime / duration
      this.$emit("timeupdate", { amountViewed: this.amountViewed, currentTime })
      this.lastTime = currentTime
    },
    setFrameDimensions() {
      const kalturaVideo = document.getElementById(this.playerId)
      const media = kalturaVideo.evaluate("{mediaProxy.entry}")

      if (media) {
        const containerDimensions = {
          width: kalturaVideo.evaluate("{video.player.width}"),
          height: window.innerHeight,
        }
        const updatedDimensions = this.fitMediaInContainer(
          media,
          containerDimensions
        )
        // Account for the height of the kaltura player bar
        updatedDimensions.height += 36
        this.$emit("change:dimensions", updatedDimensions)
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
