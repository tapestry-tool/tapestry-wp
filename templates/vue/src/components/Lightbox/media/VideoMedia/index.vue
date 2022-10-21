<template>
  <div>
    <h1 v-if="showTitle" class="video-title">
      {{ node.title }}
      <completed-icon :node="node" class="mx-2" />
    </h1>
    <div :class="'video-wrapper context-' + context" :style="{ height: heightCss }">
      <loading v-if="state === states.Loading" />
      <component
        :is="videoComponent"
        ref="video"
        :style="{ opacity: state === states.Loading ? 0 : 1 }"
        :node="node"
        :dimensions="dimensions"
        :playing="state === states.Playing"
        :autoplay="autoplay"
        :context="context"
        @change:dimensions="$emit('change:dimensions', $event)"
        @complete="handleVideoComplete"
        @close="$emit('close')"
        @load="transition(events.Load, $event)"
        @play="transition(events.Play)"
        @pause="transition(events.Pause)"
        @timeupdate="transition(events.Timeupdate, $event)"
        @seeked="handleSeek"
      />
      <div
        v-if="[states.Popup, states.Finished].includes(state)"
        class="video-layover"
      >
        <end-screen
          v-if="state === states.Finished"
          class="endscreen-container"
          :node="node"
          :context="context"
          @rewatch="transition(events.Rewatch)"
          @close="transition(events.Close)"
        />
        <popup
          v-if="activePopup"
          class="popup-container"
          :node="activePopup"
          :dimensions="dimensions"
          :context="context"
          @continue="transition(events.Continue)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

import UrlVideoMedia from "./UrlVideoMedia"
import H5PVideoMedia from "./H5PVideoMedia"
import YouTubeMedia from "./YouTubeMedia"
import KalturaMedia from "./KalturaMedia.vue"
import Popup from "./Popup"
import EndScreen from "./EndScreen"
import CompletedIcon from "@/components/common/CompletedIcon"
import { COMPLETION_THRESHOLD } from "./video.config"
import Loading from "@/components/common/Loading"
import client from "@/services/TapestryAPI"

/**
 * Video states and events as defined by the state machine diagram on Notion.
 * See:
 *   - https://www.notion.so/tapestrytool/977-Add-ability-to-create-timed-pop-up-for-Videos-1cda32c4c0e0486f8a20936bdabc0990#1212f47603534300a92aea2d59c5a248
 */
const VideoStates = {
  Loading: "loading",
  Paused: "paused",
  Playing: "playing",
  Finished: "finished",
  Popup: "popup",
  H5P: "h5p",
}

const VideoEvents = {
  Load: "load",
  Play: "play",
  Pause: "pause",
  Timeupdate: "timeupdate",
  Seeked: "seeked",
  Rewatch: "rewatch",
  Continue: "continue",
  Close: "close",
}

// How often to send progress updates (in seconds)
const updateProgressInterval = 4

export default {
  components: {
    TapestryMedia: () => import("../TapestryMedia"),
    "youtube-media": YouTubeMedia,
    "h5p-video-media": H5PVideoMedia,
    "kaltura-video-media": KalturaMedia,
    UrlVideoMedia,
    Popup,
    EndScreen,
    CompletedIcon,
    Loading,
    MultiContentMedia: () => import("../MultiContentMedia/index"),
  },
  props: {
    nodeId: {
      type: [Number, String],
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
  },
  data() {
    return {
      state: VideoStates.Loading,
      hideVideo: false,
      activePopup: null,
      progressLastUpdated: 0,
    }
  },
  computed: {
    ...mapGetters(["getNode", "getDirectChildren"]),
    states() {
      return VideoStates
    },
    events() {
      return VideoEvents
    },
    node() {
      return this.getNode(this.nodeId)
    },
    videoComponent() {
      switch (this.node.mediaFormat) {
        case "mp4":
          return "url-video-media"
        case "youtube":
          return "youtube-media"
        case "h5p":
          return "h5p-video-media"
        case "kaltura":
          return this.node.typeData.videoPlayer === "kaltura" &&
            this.node.typeData.kalturaData?.partnerId &&
            this.node.typeData.kalturaData?.serviceUrl &&
            this.node.typeData.kalturaData?.uniqueConfiguration
            ? "kaltura-video-media"
            : "url-video-media"
        default:
          throw new Error(`Unknown video type: ${this.node.mediaFormat}`)
      }
    },
    heightCss() {
      if (
        this.context !== "lightbox" &&
        this.videoComponent !== "youtube-media" &&
        this.videoComponent !== "kaltura-video-media"
      ) {
        return "auto"
      } else {
        return this.dimensions.height + "px"
      }
    },
    popups() {
      const popups = this.getDirectChildren(this.node.id)
        .map(this.getNode)
        .filter(child => child.popup != null)
        .map(child => ({
          time: child.popup.time,
          id: child.id,
          progress: child.progress,
        }))
      popups.sort((a, b) => a.time - b.time)
      return popups
    },
    showTitle() {
      return (
        this.context === "multi-content" && this.node.typeData.showTitle !== false
      )
    },
    autoplay() {
      return this.context == "lightbox"
    },
  },
  methods: {
    /**
     * This function calculates the next state given the current state and the event
     * name, as well as perform any necessary side effects.
     */
    transition(eventName, context) {
      switch (this.state) {
        case VideoStates.Loading: {
          switch (eventName) {
            case VideoEvents.Load: {
              if (context && "currentTime" in context) {
                this.lastTime = context.currentTime
                this.state = this.getLoadState()

                if (this.state === VideoStates.Playing) {
                  client.recordAnalyticsEvent(
                    "app",
                    "auto-play",
                    context.type,
                    this.node.id,
                    {
                      time: context.currentTime,
                    }
                  )
                }
              } else if (this.node.mediaType === "h5p") {
                this.state = VideoStates.H5P
              }
              this.$emit("load", context)
              break
            }
          }
          break
        }
        case VideoStates.Paused: {
          switch (eventName) {
            case VideoEvents.Play: {
              this.state = VideoStates.Playing
              break
            }
          }
          break
        }
        case VideoStates.Playing: {
          switch (eventName) {
            case VideoEvents.Pause: {
              this.state = VideoStates.Paused
              break
            }
            case VideoEvents.Timeupdate: {
              const { amountViewed, currentTime } = context
              const activePopup = this.popups.find(
                popup =>
                  popup.time > (this.lastTime || 0) && popup.time < currentTime
              )
              if (activePopup) {
                this.state = VideoStates.Popup
                this.$refs.video.pauseVideo()
                this.activePopup = this.getNode(activePopup.id)
              } else {
                if (amountViewed >= COMPLETION_THRESHOLD) {
                  this.handleVideoComplete()
                }

                // End of video
                if (amountViewed >= 1) {
                  this.state = VideoStates.Finished
                }
              }

              this.lastTime = currentTime

              let currTimestamp = Date.now()
              if (
                (currTimestamp - this.progressLastUpdated) / 1000 >
                updateProgressInterval
              ) {
                this.$emit("update-progress", { amountViewed })
                this.progressLastUpdated = currTimestamp
              }
              break
            }
          }
          break
        }
        case VideoStates.Popup: {
          switch (eventName) {
            case VideoEvents.Continue:
              this.state = VideoStates.Playing
              this.$refs.video.playVideo()
              this.activePopup = null
          }
          break
        }
        case VideoStates.Finished: {
          switch (eventName) {
            case VideoEvents.Rewatch: {
              this.$refs.video.reset()
              this.state = VideoStates.Playing
              break
            }
            case VideoEvents.Close: {
              this.$emit("close")
            }
          }
          break
        }
      }
      this.$emit(eventName, context)
    },
    /**
     * We uniquely handle seek events because they don't trigger any state
     * transitions, and can occur at any video state.
     */
    handleSeek({ currentTime }) {
      this.lastTime = currentTime
    },
    getLoadState() {
      return this.autoplay ? VideoStates.Playing : VideoStates.Paused
    },
    handleVideoComplete(nodeId) {
      if (
        !this.node.completed &&
        this.popups.every(popUpNode => popUpNode.progress)
      ) {
        this.$emit("complete", nodeId)
      }
    },
  },
}
</script>

<style scoped lang="scss">
.video-wrapper {
  width: 100%;

  &.context-multi-content {
    border-radius: 15px;
    overflow: hidden;
  }
}

.video-title {
  text-align: left;
  margin-bottom: 0.5em;
  font-weight: 500;
  font-size: 1.75rem;

  > :before {
    display: none;
  }

  .text-green {
    color: green;
  }
}

div {
  height: 100%;
  position: relative;
}

button {
  &:hover {
    background: var(--tapestry-light-gray);
  }
}

.video-layover {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  height: 100%;
  background: #000000aa;
  border-radius: 15px;
  > * {
    background: var(--bg-color-secondary);
    height: calc(100% - 2em);
    width: calc(100% - 2em);
    margin: 1em;
    padding: 1em;
    border-radius: 15px;
  }
}
</style>
