<template>
  <div>
    <loading v-if="state === states.Loading" style="color: white;" />
    <component
      :is="videoComponent"
      v-show="showVideo"
      ref="video"
      :node="node"
      :dimensions="dimensions"
      :playing="state === states.Playing"
      v-bind="$attrs"
      v-on="$listeners"
      @load="transition(events.Load, $event)"
      @play="transition(events.Play)"
      @pause="transition(events.Pause)"
      @timeupdate="transition(events.Timeupdate, $event)"
      @seeking="seeking = true"
      @seeked="handleSeek"
    />
    <tapestry-media
      v-if="state === states.Popup"
      :dimensions="dimensions"
      :node-id="activePopupId"
      @complete="$emit('complete')"
    />
    <button v-if="isPopupComplete" @click="transition(events.Continue)">
      Continue
    </button>
    <play-screen
      v-if="state === states.Paused"
      class="screen"
      @play="transition(events.Play)"
    />
    <end-screen
      v-if="state === states.Finished"
      class="screen"
      :node="node"
      @rewatch="transition(events.Rewatch)"
      @close="transition(events.Close)"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex"

import UrlVideoMedia from "./UrlVideoMedia"
import H5PMedia from "./H5PMedia"
import YouTubeMedia from "./YouTubeMedia"
import EndScreen from "../common/EndScreen"
import PlayScreen from "../common/PlayScreen"
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

export default {
  components: {
    TapestryMedia: () => import("../TapestryMedia"),
    "youtube-media": YouTubeMedia,
    "h5p-media": H5PMedia,
    UrlVideoMedia,
    EndScreen,
    PlayScreen,
    Loading,
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
    autoplay: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      state: VideoStates.Loading,
      activePopupId: null,
      seeking: false,
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
          return "h5p-media"
        default:
          throw new Error(`Unknown video type: ${this.node.mediaFormat}`)
      }
    },
    popups() {
      const popups = this.getDirectChildren(this.node.id)
        .map(this.getNode)
        .filter(child => child.popup != null)
        .map(child => ({ time: child.popup.time, id: child.id }))
      popups.sort((a, b) => a.time - b.time)
      return popups
    },
    isPopupComplete() {
      const popup = this.getNode(this.activePopupId)
      if (popup) {
        return popup.completed
      }
      return false
    },
    showVideo() {
      return [VideoStates.Paused, VideoStates.Playing].includes(this.state)
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
              if (activePopup && !this.seeking) {
                this.state = VideoStates.Popup
                this.activePopupId = activePopup.id
              } else {
                if (amountViewed >= 0.95) {
                  this.$emit("complete")
                }

                // End of video
                if (amountViewed >= 1) {
                  this.state = VideoStates.Finished
                }
              }

              this.lastTime = currentTime
              this.$emit("timeupdate", { amountViewed, currentTime })
              break
            }
          }
          break
        }
        case VideoStates.Popup: {
          switch (eventName) {
            case VideoEvents.Continue:
              this.state = VideoStates.Playing
              this.activePopupId = null
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
      this.seeking = false
    },
    getLoadState() {
      if (this.node.progress < 1) {
        return this.autoplay ? VideoStates.Playing : VideoStates.Paused
      }
      return VideoStates.Finished
    },
  },
}
</script>

<style scoped lang="scss">
div {
  height: 100%;
}

button {
  position: absolute;
  border-radius: 0.5rem;
  right: 1rem;
  bottom: 1rem;

  &:hover {
    background: var(--tapestry-light-gray);
  }
}

.screen {
  border-radius: 15px;
}
</style>
