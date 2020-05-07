<template>
  <iframe
    id="h5p"
    ref="h5p"
    frameborder="0"
    :src="node.typeData.mediaURL"
    @load="handleLoad"
  ></iframe>
</template>

<script>
import TapestryApi from "@/services/TapestryAPI"
import Helpers from "@/utils/Helpers"
import { mapActions } from "vuex"

const ALLOW_SKIP_THRESHOLD = 0.95

export default {
  name: "h5p-iframe",
  props: {
    node: {
      type: Object,
      required: false,
      default: () => {
        return {}
      },
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
  watch: {
    node(_, oldNode) {
      this.handlePause(oldNode)
    },
  },
  beforeDestroy() {
    this.handlePause(this.node)
  },
  methods: {
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
    handlePlay(node) {
      const { id, mediaType } = node
      const progressVal = node.typeData.progress ? node.typeData.progress[0].value : 0
      thisTapestryTool.updateMediaIcon(id, mediaType, "pause")
      thisTapestryTool.recordAnalyticsEvent("user", "play", "h5p-video", id, {
        time: progressVal * node.mediaDuration,
      })
    },
    handlePause(node) {
      const { id, mediaType } = node
      const progressVal = node.typeData.progress ? node.typeData.progress[0].value : 0
      thisTapestryTool.updateMediaIcon(id, mediaType, "play")
      thisTapestryTool.recordAnalyticsEvent("user", "pause", "h5p-video", id, {
        time: progressVal * node.mediaDuration,
      })
    },
    handleLoad() {
      const h5pObj = this.$refs.h5p.contentWindow.H5P
      this.$emit("is-loaded", h5pObj)

      $("iframe").each(function() {
        $(this)
          .data("ratio", this.height / this.width)
          // Remove the hardcoded width & height attributes
          .removeAttr("width")
          .removeAttr("height")
      })
      const setIframeDimensions = function() {
        $("iframe").each(function() {
          // Get the parent container's width
          var width = $(this)
            .parent()
            .width()
          var height = $(this)
            .parent()
            .height()
          if (width * $(this).data("ratio") <= height) {
            $(this)
              .width(width)
              .height(width * $(this).data("ratio"))
          } else {
            $(this)
              .height(height)
              .width(height / $(this).data("ratio"))
          }
        })
      }
      $(window).resize(setIframeDimensions)
      setIframeDimensions()

      const h5pInstance = h5pObj.instances[0]
      const loadedH5PId = h5pInstance.contentId

      const h5pLibraryName = h5pInstance.libraryInfo.machineName

      // Check to see whether this is an H5P recorder
      // If it is, we can emit an event to load the recorded audio (if exists)
      // and terminate
      if (h5pInstance.recorder && loadedH5PId) {
        this.loadedH5PRecorderId = loadedH5PId
        this.h5pRecorderSaverIsLoaded()
        return
      }

      const mediaProgress = this.node.typeData.progress ? this.node.typeData.progress[0].value : 0

      if (h5pLibraryName === "H5P.InteractiveVideo") {
        const h5pVideo = h5pInstance.video
        const h5pIframeComponent = this

        const handleH5pAfterLoad = function() {
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
                    thisTapestryTool.updateProgressBars()

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

              case h5pObj.Video.BUFFERING: {
                const { id, mediaType } = h5pIframeComponent.node
                thisTapestryTool.updateMediaIcon(id, mediaType, "loading")
                break
              }
            }
          })
          if (h5pIframeComponent.autoplay) {
            setTimeout(() => {
              h5pVideo.play()
              thisTapestryTool.recordAnalyticsEvent(
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
    },
    toggleMuteIcon() {
      const body = this.$refs.h5p.contentWindow.H5P.$body[0]
      const btn = body.querySelector(".h5p-mute")
      btn.classList.toggle("h5p-muted")
    },
  },
}
</script>

<style lang="scss" scoped></style>
