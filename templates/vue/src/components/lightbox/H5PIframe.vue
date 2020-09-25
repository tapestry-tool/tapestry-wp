<template>
  <div
    ref="h5pIframeContainer"
    class="h5p-iframe-container"
    :class="{
      'fill-window': !node.fitWindow,
      'context-accordion': context === 'accordion',
    }"
    :style="{
      height: this.frameHeight ? this.frameHeight + 'px' : 'auto',
      width: this.frameWidth ? this.frameWidth + 'px' : '100%',
      opacity: this.loading ? 0 : 1,
    }"
  >
    <iframe
      id="h5p"
      ref="h5p"
      height="100%"
      width="100%"
      frameborder="0"
      :src="node.typeData && node.typeData.mediaURL"
      :scrolling="type === 'H5P.InteractiveVideo' && 'no'"
      @load="handleLoad"
    ></iframe>
  </div>
</template>

<script>
import Helpers from "@/utils/Helpers"
import client from "@/services/TapestryAPI"

const ALLOW_SKIP_THRESHOLD = 0.95

export default {
  name: "h5p-iframe",
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
    settings: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    autoplay: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      instance: null,
      frameHeight: 0,
      frameWidth: "100%",
      type: null,
      loading: true,
      requiresRefresh: false,
    }
  },
  watch: {
    node(_, oldNode) {
      this.handlePause(oldNode)
    },
  },
  beforeDestroy() {
    this.handlePause(this.node)
    window.removeEventListener("resize", this.setFrameHeight)
    document.removeEventListener("fullscreenchange", this.setFrameHeight)
    document.removeEventListener("webkitfullscreenchange", this.setFrameHeight)
    document.removeEventListener("mozfullscreenchange", this.setFrameHeight)
  },
  methods: {
    setFrameHeight() {
      const h5pDimensions = this.instance.parent.$container[0].getBoundingClientRect()
      let widthScaled = false

      // default
      this.frameHeight = h5pDimensions.height
      this.frameWidth = 0

      if (this.node.fitWindow) {
        // Video should fit within the smaller of the viewport or the container it's in
        let fitHeight = Math.min(window.innerHeight, this.dimensions.height)
        if (this.context === "accordion") {
          // Count for the accordion header
          // TODO: Find a better way of doing this without hardcoding the heigh value
          fitHeight -= 100
        }
        // Proportionally make the frame smaller
        let scaleFactor = fitHeight / h5pDimensions.height
        this.frameHeight = h5pDimensions.height * scaleFactor
        this.frameWidth = h5pDimensions.width * scaleFactor

        // if the width is bigger than the available space, we need to scale based on the width
        let fitWidth = this.$refs.h5pIframeContainer.clientWidth
        if (this.frameWidth > fitWidth) {
          scaleFactor = fitWidth / h5pDimensions.width
          this.frameWidth = h5pDimensions.width * scaleFactor
          this.frameHeight = h5pDimensions.height * scaleFactor
        } else {
          widthScaled = true
        }
      }

      if (this.loading) {
        // Fix for unknown issue where H5P height is just a bit short
        if (widthScaled && this.frameHeight) {
          this.frameHeight += 8
        }
        if (this.requiresRefresh) {
          this.$refs.h5p.contentWindow.location.reload()
          setTimeout(() => {
            this.loading = false
            this.$emit("is-loaded")
          }, 2000)
        } else {
          this.loading = false
          this.$emit("is-loaded")
        }
      }

      this.$emit("change:dimensions", {
        width: this.frameWidth,
        height: this.frameHeight,
      })
    },
    play() {
      const h5pObj = this.$refs.h5p.contentWindow.H5P
      const h5pVideo = h5pObj.instances[0].video
      if (h5pVideo) {
        h5pVideo.play()
      }
    },
    rewatch() {
      const h5pObj = this.$refs.h5p.contentWindow.H5P
      const h5pVideo = h5pObj.instances[0].video
      h5pVideo.seek(0)
      h5pVideo.play()
    },
    close() {
      const h5pObj = this.$refs.h5p.contentWindow.H5P
      const h5pVideo = h5pObj.instances[0].video
      if (h5pVideo) {
        h5pVideo.pause()
      }
    },
    updateSettings(h5pVideo) {
      let newSettings = {}

      try {
        newSettings.volume = h5pVideo.getVolume()
      } catch (Error) {
        console.error("H5P volume not saved", Error)
      }

      try {
        newSettings.muted = h5pVideo.isMuted()
      } catch (Error) {
        console.error("H5P mute status not saved", Error)
      }

      try {
        newSettings.playbackRate = h5pVideo.getPlaybackRate()
      } catch (Error) {
        console.error("H5P playback rate not saved", Error)
      }

      try {
        newSettings.quality = h5pVideo.getQuality()
      } catch (Error) {
        console.error("H5P quality settings not saved", Error)
      }

      try {
        newSettings.caption = h5pVideo.getCaptionsTrack()
      } catch (Error) {
        console.error("H5P caption selection not saved", Error)
      }

      if (Helpers.isDifferent(newSettings, this.settings)) {
        this.$emit("update-settings", newSettings)
      }
    },
    applySettings(h5pVideo) {
      const settings = this.settings
      if (settings.volume !== undefined) {
        h5pVideo.setVolume(settings.volume)
      }
      if (settings.muted !== undefined) {
        if (settings.muted) {
          h5pVideo.mute()
          this.toggleMuteIcon()
        } else {
          h5pVideo.unMute()
        }
      }
      if (settings.playbackRate !== undefined) {
        h5pVideo.setPlaybackRate(settings.playbackRate)
      }
      if (settings.quality !== undefined) {
        h5pVideo.setQuality(settings.quality)
      }
      if (settings.caption !== undefined) {
        h5pVideo.setCaptionsTrack(settings.caption)
      }
    },
    handlePlay() {
      this.$emit("show-play-screen", false)
      const { id, progress, mediaDuration } = this.node
      client.recordAnalyticsEvent("user", "play", "h5p-video", id, {
        time: progress * mediaDuration,
      })
    },
    handlePause() {
      this.$emit("show-play-screen", true)
      const { id, progress, mediaDuration } = this.node
      client.recordAnalyticsEvent("user", "pause", "h5p-video", id, {
        time: progress * mediaDuration,
      })
    },
    handleLoad() {
      const h5pObj = this.$refs.h5p.contentWindow.H5P
      const h5pInstance = h5pObj.instances[0]
      const loadedH5PId = h5pInstance.contentId

      const h5pLibraryName = h5pInstance.libraryInfo.machineName
      this.type = h5pLibraryName

      if (h5pLibraryName !== "H5P.InteractiveVideo") {
        this.frameHeight = this.dimensions.height
      }

      // Check to see whether this is an H5P recorder
      // If it is, we can emit an event to load the recorded audio (if exists)
      // and terminate
      if (h5pInstance.recorder && loadedH5PId) {
        this.loadedH5PRecorderId = loadedH5PId
        this.h5pRecorderSaverIsLoaded()
        return
      }

      const mediaProgress = this.node.progress

      if (h5pLibraryName === "H5P.InteractiveVideo") {
        const h5pVideo = h5pInstance.video
        const h5pIframeComponent = this

        const handleH5pAfterLoad = () => {
          h5pIframeComponent.instance = h5pVideo

          h5pIframeComponent.setFrameHeight()
          window.addEventListener("resize", h5pIframeComponent.setFrameHeight)
          document.addEventListener(
            "fullscreenchange",
            h5pIframeComponent.setFrameHeight
          )
          document.addEventListener(
            "webkitfullscreenchange",
            h5pIframeComponent.setFrameHeight
          )
          document.addEventListener(
            "mozfullscreenchange",
            h5pIframeComponent.setFrameHeight
          )

          h5pIframeComponent.$emit("load", { el: h5pVideo })

          let currentPlayedTime

          const videoDuration = h5pVideo.getDuration()
          h5pVideo.seek(mediaProgress * videoDuration)

          const viewedAmount = mediaProgress * videoDuration
          if (viewedAmount === videoDuration) {
            h5pIframeComponent.$emit("show-end-screen")
          }

          h5pIframeComponent.applySettings(h5pVideo)

          h5pVideo.on("stateChange", event => {
            switch (event.data) {
              case h5pObj.Video.PLAYING: {
                const updateVideoInterval = setInterval(() => {
                  if (
                    currentPlayedTime !== h5pVideo.getCurrentTime() &&
                    h5pVideo.getCurrentTime() > 0
                  ) {
                    currentPlayedTime = h5pVideo.getCurrentTime()
                    const amountViewed = currentPlayedTime / videoDuration

                    h5pIframeComponent.$emit("timeupdate", amountViewed)

                    h5pIframeComponent.updateSettings(h5pVideo)

                    if (amountViewed >= ALLOW_SKIP_THRESHOLD) {
                      h5pIframeComponent.$emit("complete")
                    }

                    if (amountViewed >= 1) {
                      h5pIframeComponent.$emit("show-end-screen")
                    }
                  } else {
                    clearInterval(updateVideoInterval)
                  }
                }, 1000)
                h5pIframeComponent.handlePlay(h5pIframeComponent.node)
                break
              }

              case h5pObj.Video.PAUSED: {
                h5pIframeComponent.handlePause(h5pIframeComponent.node)
                break
              }
            }
          })
          if (h5pIframeComponent.autoplay) {
            setTimeout(() => {
              h5pVideo.play()
              client.recordAnalyticsEvent(
                "app",
                "auto-play",
                "h5p-video",
                h5pIframeComponent.node.id
              )
            }, 1000)
          }
        }

        if (h5pVideo.getDuration() !== undefined) {
          this.requiresRefresh = this.context === "accordion"
          handleH5pAfterLoad()
        } else {
          h5pVideo.on("loaded", handleH5pAfterLoad)
        }
      } else {
        this.loading = false
        this.$emit("is-loaded")
      }
    },
    toggleMuteIcon() {
      const body = this.$refs.h5p.contentWindow.H5P.$body[0]
      const btn = body.querySelector(".h5p-mute")
      btn.classList.toggle("h5p-muted")
    },
  },
}
</script>
<style lang="scss">
.h5p-iframe-container {
  margin: auto;
  overflow: hidden;
  border-radius: 15px;
  &:not(.context-accordion) {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  }
  iframe {
    margin: -1px !important;
    min-width: calc(100% + 4px);
  }
}
</style>
