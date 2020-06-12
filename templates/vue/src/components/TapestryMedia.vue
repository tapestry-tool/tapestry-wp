<template>
  <div
    :class="[
      'media-wrapper',
      { 'media-wrapper-embed': node.mediaFormat === 'embed' },
      {
        'media-wrapper-no-scroll':
          node.mediaFormat === 'mp4' ||
          node.mediaFormat === 'h5p' ||
          node.mediaFormat === 'youtube'
      },
    ]"
    :style="containerStyles"
  >
    <text-media
      v-if="node.mediaType === 'text'"
      :node="node"
      @complete="complete"
      @load="handleLoad"
    />
    <video-media
      v-if="node.mediaFormat === 'mp4'"
      :autoplay="autoplay"
      :node="node"
      :dimensions="dimensions"
      :allow-end-screen="allowEndScreen"
      @load="handleLoad"
      @complete="complete"
      @timeupdate="updateProgress"
      @close="$emit('close')"
    />
    <youtube-media
      v-if="node.mediaFormat === 'youtube'"
      :autoplay="autoplay"
      :node="node"
      :dimensions="dimensions"
      :allow-end-screen="allowEndScreen"
      @load="handleLoad"
      @complete="complete"
      @timeupdate="updateProgress"
      @close="$emit('close')"
    />
    <external-media
      v-if="node.mediaType === 'url-embed'"
      :dimensions="dimensions"
      :node="node"
      @load="handleLoad"
      @complete="complete"
    />
    <h5p-media
      v-if="node.mediaFormat === 'h5p'"
      :autoplay="autoplay"
      :dimensions="dimensions"
      :node="node"
      :allow-end-screen="allowEndScreen"
      :read-only="readOnly"
      @change:dimensions="$emit('change:dimensions', $event)"
      @load="handleLoad"
      @timeupdate="updateProgress"
      @complete="complete"
      @close="$emit('close')"
    />
    <gravity-form
      v-if="node.mediaType === 'gravity-form' && !showCompletionScreen"
      :id="node.typeData.mediaURL"
      :node="node"
      :read-only="readOnly"
      @submit="handleFormSubmit"
      @load="handleLoad"
    ></gravity-form>
    <wp-post-media
      v-if="node.mediaType === 'wp-post'"
      :node="node"
      @complete="complete"
      @load="handleLoad"
    ></wp-post-media>
    <quiz-media
      v-if="node.mediaType === 'activity'"
      :node="node"
      :read-only="readOnly"
      @complete="complete"
      @close="$emit('close')"
      @load="handleLoad"
    />
    <completion-screen v-if="showCompletionScreen" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import TextMedia from "./lightbox/TextMedia"
import VideoMedia from "./lightbox/VideoMedia"
import ExternalMedia from "./lightbox/ExternalMedia"
import H5PMedia from "./lightbox/H5PMedia"
import GravityForm from "./lightbox/GravityForm"
import WpPostMedia from "./lightbox/WpPostMedia"
import CompletionScreen from "./lightbox/quiz-screen/CompletionScreen"
import QuizMedia from "./lightbox/QuizMedia"
import Helpers from "@/utils/Helpers"
import YoutubeMedia from "./lightbox/YoutubeMedia"

const SAVE_INTERVAL = 5

export default {
  name: "tapestry-media",
  components: {
    TextMedia,
    VideoMedia,
    ExternalMedia,
    "h5p-media": H5PMedia,
    GravityForm,
    WpPostMedia,
    CompletionScreen,
    QuizMedia,
    YoutubeMedia,
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
    containerStyles: {
      type: Object,
      required: false,
      default: () => {},
    },
    allowEndScreen: {
      type: Boolean,
      required: false,
      default: true,
    },
    autoplay: {
      type: Boolean,
      required: false,
      default: true,
    },
    readOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      showCompletionScreen: false,
      timeSinceLastSaved: new Date(),
    }
  },
  computed: {
    ...mapGetters(["getNode", "getDirectParents"]),
    node() {
      return this.getNode(this.nodeId)
    },
  },
  beforeDestroy() {
    if (Helpers.canUserUpdateProgress(this.node)) {
      this.updateNodeProgress({
        id: this.nodeId,
        progress: this.node && this.node.typeData.progress[0].value,
      })
    }
  },
  methods: {
    ...mapActions(["updateNodeProgress", "updateH5pSettings"]),
    handleFormSubmit() {
      this.showCompletionScreen = true
      this.complete()
    },
    handleLoad(args) {
      this.$emit("load", args)
    },
    updateProgress: Helpers.throttle(function(amountViewed) {
      if (Helpers.canUserUpdateProgress(this.node) && !this.readOnly) {
        this.updateNodeProgress({ id: this.nodeId, progress: amountViewed })
      }
    }, SAVE_INTERVAL),
    complete() {
      if (!this.readOnly) {
        this.$emit("complete")
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.media-wrapper {
  background: inherit;
  outline: none;
  border-radius: 15px;
  overflow: scroll;
  height: 100%;
  padding: 0;

  &-no-scroll {
    overflow: hidden;
  }

  &-embed {
    background: white;
  }
}
</style>
