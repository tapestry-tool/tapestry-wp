<template>
  <div
    :id="`kaltura-container-${node.id}`"
    ref="kalturaContainer"
    :class="['kaltura-video-container', { fullscreen: node.fullscreen }]"
  ></div>
</template>

<script>
import client from "@/services/TapestryAPI"
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
      onLoad: true,
      playerId: "",
      amountViewed: 0,
    }
  },
  computed: {
    ...mapState(["kalturaStatus"]),
    kalturaData() {
      return this.node.typeData.kalturaData
    },
  },
  watch: {
    playing() {
      if (this.playing && this.playerId) {
        const kalturaVideo = document.getElementById(this.playerId)
        if (this.onLoad) {
          const videoDuration = kalturaVideo.evaluate("{duration}")
          const currentTime = this.node.progress * videoDuration
          if (this.node.completed) {
            this.$emit("timeupdate", { amountViewed: currentTime, currentTime })
          } else {
            kalturaVideo.sendNotification("doSeek", currentTime)
            this.lastTime = currentTime
            this.onLoad = false
          }
        }
        kalturaVideo.sendNotification("doPlay")
      }
    },
  },
  created() {
    const kalturaScript = document.createElement("script")
    kalturaScript.src =
      "https://admin.video.ubc.ca/p/163/sp/163300/embedIframeJs/uiconf_id/23449696/partner_id/163"

    kalturaScript.id = "kaltura-script"

    kalturaScript.addEventListener("load", () => {
      kWidget.embed({
        targetId: `kaltura-container-${this.node.id}`,
        wid: `_${wpData.kaltura.kalturaPartnerId}`,
        uiconf_id: wpData.kaltura.uniqueConfiguration,
        entry_id: this.kalturaData.id,
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
    ...mapActions(["fetchKalturaStatus"]),
    updateVideoProgress(currentTime, duration) {
      this.amountViewed = currentTime / duration
      this.$emit("timeupdate", { amountViewed: this.amountViewed, currentTime })
      this.lastTime = currentTime
    },
    reset() {
      this.amountViewed = 0
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
