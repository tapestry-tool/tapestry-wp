<template>
  <iframe
    id="h5p"
    ref="h5p"
    frameborder="0"
    :src="node.typeData && node.typeData.mediaURL"
    :width="width"
    @load="handleLoad"
  ></iframe>
</template>

<script>
import TapestryApi from "@/services/TapestryAPI"
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
      type: [Object, String],
      required: false,
      default: () => {
        return {}
      },
    },
    autoplay: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      width: 50,
      recordedNodeIds: [],
      loadedH5PRecorderId: 0,
      TapestryAPI: new TapestryApi(wpPostId),
    }
  },
  computed: {
    userLoggedIn: function() {
      return wpApiSettings && wpApiSettings.userLoggedIn === "true"
    },
  },
  watch: {
    node(_, oldNode) {
      this.handlePause(oldNode)
    },
  },
  async mounted() {
    this.recordedNodeIds = await this.TapestryAPI.getRecordedNodeIds()

    // Listen to event dispatched by H5P Audio Recorder lib
    window.addEventListener("tapestry-h5p-audio-recorder", this.saveH5PAudioToServer)
  },
  beforeDestroy() {
    this.handlePause(this.node)
    // Detach listener to event dispatched by H5P Audio Recorder lib
    window.removeEventListener(
      "tapestry-h5p-audio-recorder",
      this.saveH5PAudioToServer
    )
  },
  methods: {
    ...mapActions(["completeQuestion"]),
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
    async h5pRecorderSaverIsLoaded() {
      if (
        this.loadedH5PRecorderId &&
        this.node.id &&
        this.recordedNodeIds.includes(this.node.id)
      ) {
        await this.loadH5PAudio(this.node.id, this.loadedH5PRecorderId)
      }
    },
    async loadH5PAudio(nodeMetaId, loadedH5PRecorderId) {
      try {
        const h5pAudioRecorder = document.getElementById("h5p")
        const audio = await this.TapestryAPI.getH5PAudioFromServer(
          nodeMetaId,
          loadedH5PRecorderId
        )
        if (audio && h5pAudioRecorder) {
          dispatchEvent(
            new CustomEvent("tapestry-get-h5p-audio", {
              detail: { audio },
            })
          )
        }
      } catch (e) {
        console.error(e)
      }
    },
    async saveH5PAudioToServer(event) {
      const encodedH5PAudio = event.detail.base64data.replace(
        /^data:audio\/[a-z]+;base64,/,
        ""
      )
      if (encodedH5PAudio && this.userLoggedIn && this.loadedH5PRecorderId) {
        try {
          const audio = {
            blob: encodedH5PAudio,
            h5pId: this.loadedH5PRecorderId,
          }
          await this.TapestryAPI.uploadAudioToServer(this.node.id, audio)
          this.setQuestionCompleted()
          this.$emit("submit")
          this.recordedNodeIds.push(this.node.id)
        } catch (e) {
          console.error(e)
        }
      }
    },
    setQuestionCompleted() {
      this.node.quiz.forEach(async q => {
        if (q.answers && q.answers.audioId == this.loadedH5PRecorderId) {
          await this.completeQuestion({
            nodeId: this.node.id,
            questionId: q.id,
            answerType: "audioId",
            audioId: this.loadedH5PRecorderId,
          })
        }
      })
    },
    handlePlay(node) {
      const { id, mediaType } = node
      thisTapestryTool.updateMediaIcon(id, mediaType, "pause")
      thisTapestryTool.recordAnalyticsEvent("user", "play", "h5p-video", id, {
        time: node.typeData.progress[0].value * node.mediaDuration,
      })
    },
    handlePause(node) {
      const { id, mediaType } = node
      thisTapestryTool.updateMediaIcon(id, mediaType, "play")
      thisTapestryTool.recordAnalyticsEvent("user", "pause", "h5p-video", id, {
        time: node.typeData.progress[0].value * node.mediaDuration,
      })
    },
    handleLoad() {
      this.$emit("is-loaded")

      if (this.node.fullscreen) {
        const frame = this.$refs.h5p
        frame.removeAttribute("width")
        frame.removeAttribute("height")
        const setIframeDimensions = () => {
          const { width, height } = frame.getBoundingClientRect()
          const parentHeight = frame.parentNode.getBoundingClientRect().height
          if (height > parentHeight) {
            const ratio = height / width
            if (ratio < 1) {
              const newWidth = width * (parentHeight / height)
              frame.style.width = newWidth + "px"
              frame.style.height = parentHeight + "px"
            }
          }
        }
        $(window).resize(setIframeDimensions)
        setIframeDimensions()
      }

      const h5pObj = this.$refs.h5p.contentWindow.H5P
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

      const mediaProgress = this.node.typeData.progress[0].value

      if (h5pLibraryName === "H5P.InteractiveVideo") {
        const h5pVideo = h5pInstance.video
        const h5pIframeComponent = this

        h5pVideo.on("loaded", function() {
          const videoDuration = h5pVideo.getDuration()
          h5pIframeComponent.$emit("load", { el: h5pVideo })

          const settings = h5pIframeComponent.settings

          let seeked = false
          let currentPlayedTime

          h5pVideo.seek(mediaProgress * videoDuration)

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
                    h5pIframeComponent.$emit("show-end-screen")
                  }
                  seeked = true
                }
                h5pIframeComponent.handlePlay(h5pIframeComponent.node)
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
                h5pIframeComponent.handlePause(h5pIframeComponent.node)
                h5pIframeComponent.$emit("update-settings", newSettings)
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
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
