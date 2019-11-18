<template>
  <div class="container">
    <end-screen :show="showEndScreen" @rewatch="rewatch" @close="close" />
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
  </div>
</template>

<script>
import EndScreen from "./EndScreen"

const ALLOW_SKIP_THRESHOLD = 0.95

export default {
  name: "h5p-media",
  components: {
    EndScreen,
  },
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
  data() {
    return {
      showEndScreen: false,
    }
  },
  methods: {
    rewatch() {
      this.showEndScreen = false
      const h5pObj = this.$refs.h5p.contentWindow.H5P
      const h5pVideo = h5pObj.instances[0].video
      h5pVideo.seek(0)
      h5pVideo.play()
    },
    close() {
      this.showEndScreen = false
      const h5pObj = this.$refs.h5p.contentWindow.H5P
      const h5pVideo = h5pObj.instances[0].video
      if (h5pVideo) {
        h5pVideo.pause()
      }
      this.$emit("close")
    },
    handleLoad() {

      $('iframe').each(function () {
        $( this ).data( "ratio", this.height / this.width )
          // Remove the hardcoded width & height attributes
          .removeAttr( "width" )
          .removeAttr( "height" );
      });
      const setIframeDimensions = function() {
        $('iframe').each( function() {
          // Get the parent container's width
          var width = $( this ).parent().width();
          var height = $( this ).parent().height();
          if (width * $( this ).data( "ratio" ) <= height) {
            $( this ).width( width )
              .height( width * $( this ).data( "ratio" ) );
          }
          else {
            $( this ).height( height )
              .width( height / $( this ).data( "ratio" ) );
          }
        });
      }
      $( window ).resize(setIframeDimensions);
      setIframeDimensions();

      const h5pObj = this.$refs.h5p.contentWindow.H5P
      const mediaProgress = this.node.typeData.progress[0].value

      this.$emit('h5p-media-loaded', { loadedH5pId: h5pObj.instances[0].contentId })

      if (this.node.mediaType === "video") {
        const h5pVideo = h5pObj.instances[0].video
        const settings = this.settings

        // If h5pVideo is undefined, let's return
        // This is because we don't have a separate type for H5P recorder
        if (!h5pVideo) {
          return
        }

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
                  const amountViewed = currentPlayedTime / videoDuration

                  this.$emit("timeupdate", "h5p", amountViewed)
                  thisTapestryTool.updateProgressBars()

                  if (amountViewed >= ALLOW_SKIP_THRESHOLD) {
                    this.$emit("complete")
                  }

                  if (amountViewed >= 1) {
                    this.showEndScreen = true
                  }
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

                const viewedAmount = mediaProgress * videoDuration
                if (viewedAmount > 0) {
                  h5pVideo.seek(viewedAmount)
                }
                if (viewedAmount === videoDuration) {
                  this.showEndScreen = true
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

<style lang="scss" scoped>
.container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100vw;
  padding: 0;
}
</style>
