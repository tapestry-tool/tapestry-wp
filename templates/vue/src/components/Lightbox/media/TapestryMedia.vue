<template>
  <div
    :class="[
      'media-wrapper',
      { 'media-wrapper-embed': node.mediaFormat === 'embed' },
      {
        'media-wrapper-no-scroll':
          node.mediaFormat === 'mp4' ||
          node.mediaFormat === 'h5p' ||
          node.mediaFormat === 'youtube',
      },
    ]"
  >
    <text-media
      v-if="node.mediaType === 'text'"
      :node="node"
      @complete="complete"
      @load="handleLoad"
    />
    <video-media
      v-if="isVideoNode"
      :autoplay="autoplay"
      :dimensions="dimensions"
      :context="context"
      :node-id="nodeId"
      @change:dimensions="$emit('change:dimensions', $event)"
      @load="handleLoad"
      @timeupdate="updateProgress"
      @complete="complete"
      @close="$emit('close')"
    />
    <external-media
      v-if="node.mediaType === 'url-embed'"
      :dimensions="dimensions"
      :node="node"
      @load="handleLoad"
      @complete="complete"
    />
    <gravity-form
      v-if="node.mediaType === 'gravity-form' && !showCompletionScreen"
      :id="node.typeData.mediaURL"
      @submit="handleFormSubmit"
      @load="handleLoad"
    ></gravity-form>
    <wp-post-media
      v-if="node.mediaType === 'wp-post'"
      :node="node"
      @complete="complete"
      @load="handleLoad"
    ></wp-post-media>
    <activity-media
      v-if="node.mediaType === 'activity'"
      :node="node"
      @complete="complete"
      @close="$emit('close')"
      @load="handleLoad"
    />
    <completion-screen v-if="showCompletionScreen" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import TextMedia from "./TextMedia"
import VideoMedia from "./VideoMedia"
import ExternalMedia from "./ExternalMedia"
import ActivityMedia from "./ActivityMedia"
import WpPostMedia from "./WpPostMedia"
import GravityForm from "./common/GravityForm"
import CompletionScreen from "./common/ActivityScreen/CompletionScreen"

export default {
  name: "tapestry-media",
  components: {
    TextMedia,
    VideoMedia,
    ExternalMedia,
    GravityForm,
    WpPostMedia,
    CompletionScreen,
    ActivityMedia,
  },
  props: {
    nodeId: {
      type: [Number, String],
      required: true,
    },
    dimensions: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    context: {
      type: String,
      required: false,
      default: "lightbox",
    },
    autoplay: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      showCompletionScreen: false,
      timeSinceLastSaved: new Date(),
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
    node() {
      return this.getNode(this.nodeId)
    },
    isVideoNode() {
      return ["mp4", "youtube", "h5p"].includes(this.node.mediaFormat)
    },
  },
  beforeDestroy() {
    this.updateNodeProgress({
      id: this.nodeId,
      progress: this.node && this.node.progress,
    })
  },
  methods: {
    ...mapActions(["updateNodeProgress"]),
    handleFormSubmit() {
      this.showCompletionScreen = true
      this.complete()
    },
    handleLoad(args) {
      this.$emit("load", args)
    },
    updateProgress({ amountViewed }) {
      this.updateNodeProgress({ id: this.nodeId, progress: amountViewed })
    },
    complete(nodeId) {
      this.$emit("complete", nodeId)
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
