<template>
  <iframe
    id="h5p"
    ref="h5p"
    frameborder="0"
    allowfullscreen="allowfullscreen"
    :src="node.typeData.mediaURL"
    :width="width"
    :height="height"
    @load="handleLoad"
  ></iframe>
</template>

<script>
export default {
  name: "h5p-media",
  props: {
    node: {
      type: Object,
      required: true,
    },
    settings: {
      type: Object,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
  },
  methods: {
    handleLoad() {
      const h5pObj = this.$refs.h5p.contentWindow.H5P
      const mediaProgress = this.node.typeData.progress[0].value

      if (this.node.mediaType === "video") {
        const h5pVideo = h5pObj.instances[0].video
        this.$emit("load", { el: h5pVideo })

        const settings = this.settings

        let seeked = false
        let currentPlayedTime

        h5pVideo.on("stateChange", event => {
          switch (event.data) {
            case h5pObj.Video.PLAYING: {
              const videoDuration = h5pVideo.getDuration()
              const updateVideoInterval = setInterval(() => {
                if (
                  currentPlayedTime !== h5pVideo.getCurrentTime() &&
                  h5pVideo.getCurrentTime() > 0
                ) {
                  currentPlayedTime = h5pVideo.getCurrentTime()
                  this.$emit("timeupdate", "h5p", currentPlayedTime / videoDuration)
                  thisTapestryTool.updateProgressBars()
                } else {
                  clearInterval(updateVideoInterval)
                }
              }, 300)

              if (!seeked) {
                // Change the video settings to whatever the user had set before
                if (settings.volume !== undefined) {
                  h5pVideo.setVolume(settings.volume)

                  if (settings.muted) {
                    h5pVideo.mute()
                  } else {
                    h5pVideo.unMute()
                  }

                  h5pVideo.setCaptionsTrack(settings.caption)
                  h5pVideo.setQuality(settings.quality)
                  h5pVideo.setPlaybackRate(settings.playbackRate)
                }
                // Play the video at the last watched time (or at the beginning if the user has not watched yet or if the user had already viewed whole video)
                const viewedAmount = mediaProgress * videoDuration
                if (viewedAmount > 0 && viewedAmount !== videoDuration) {
                  h5pVideo.seek(viewedAmount)
                } else {
                  h5pVideo.seek(0)
                }
                seeked = true
              }

              const { id, mediaType } = this.node
              thisTapestryTool.updateMediaIcon(id, mediaType, "pause")
              thisTapestryTool.recordAnalyticsEvent(
                "user",
                "play",
                "h5p-video",
                id,
                { time: h5pVideo.getCurrentTime() }
              )

              break
            }

            case h5pObj.Video.PAUSED: {
              const newSettings = {
                volume: h5pVideo.getVolume(),
                muted: h5pVideo.isMuted(),
                caption: h5pVideo.getCaptionsTrack(),
                quality: h5pVideo.getQuality(),
                playbackRate: h5pVideo.getPlaybackRate(),
                time: h5pVideo.getCurrentTime(),
              }
              seeked = true
              const { id, mediaType } = this.node
              thisTapestryTool.updateMediaIcon(id, mediaType, "play")
              thisTapestryTool.recordAnalyticsEvent(
                "user",
                "pause",
                "h5p-video",
                id,
                { time: h5pVideo.getCurrentTime() }
              )
              this.$emit("update-settings", newSettings)
              break
            }

            case h5pObj.Video.BUFFERING: {
              const { id, mediaType } = this.node
              thisTapestryTool.updateMediaIcon(id, mediaType, "loading")
              break
            }
          }
        })
        setTimeout(() => {
          h5pVideo.play()
          thisTapestryTool.recordAnalyticsEvent(
            "app",
            "auto-play",
            "h5p-video",
            this.node.id
          )
        }, 1000)
      }
    },
  },
}
</script>

<style scoped></style>
