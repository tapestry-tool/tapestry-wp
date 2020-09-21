<template>
  <div
    class="h5p-iframe-container"
    :class="{
      'fill-window': !node.fitWindow,
      'context-accordion': context === 'accordion',
    }"
    :style="
      'height:' + (frameHeight ? frameHeight : 'auto') + ';width:' + frameWidth
    "
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
      played: false,
      type: null,
    }
  },
  watch: {
    node(_, oldNode) {
      this.handlePause(oldNode)
    },
  },
  beforeDestroy() {
    this.handlePause(this.node)
  },
  methods: {
    setFrameHeight() {
      const h5pContainer = this.instance.parent.$container[0].getBoundingClientRect()

      // default
      this.frameHeight = h5pContainer.height + "px"
      this.frameWidth = "100%"

      if (this.node.fitWindow) {
        // H5P should fit within the smaller of the viewport or the container it's in
        let fitHeight = Math.min(window.innerHeight, this.dimensions.height)

        // We need to resize IF the height or width is bigger than the viewport/container
        if (h5pContainer.height > fitHeight + 5) {
          // Count for the accordion header
          if (this.context === "accordion") {
            fitHeight -= 100
          }
          const scaleFactor = fitHeight / h5pContainer.height
          this.frameHeight = h5pContainer.height * scaleFactor + "px"
          this.frameWidth = h5pContainer.width * scaleFactor + "px"
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
          this.instance = h5pVideo
          this.setFrameHeight()
          window.addEventListener("resize", this.setFrameHeight)

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
          handleH5pAfterLoad()
        } else {
          h5pVideo.on("loaded", handleH5pAfterLoad)
        }
      }
      this.$emit("is-loaded")
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
