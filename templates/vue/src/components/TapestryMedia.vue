<template>
  <div
    :class="[
      'media-wrapper',
      { 'media-wrapper-embed': node.mediaFormat === 'embed' },
      {
        'media-wrapper-no-scroll':
          node.mediaFormat === 'mp4' || node.mediaFormat === 'h5p',
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
      v-if="node.mediaFormat === 'mp4'"
      :autoplay="autoplay"
      :node="node"
      :dimensions="dimensions"
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
      @load="handleLoad"
      @timeupdate="updateProgress"
      @complete="complete"
      @close="$emit('close')"
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
    <quiz-media
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
import TextMedia from "./lightbox/TextMedia"
import VideoMedia from "./lightbox/VideoMedia"
import ExternalMedia from "./lightbox/ExternalMedia"
import H5PMedia from "./lightbox/H5PMedia"
import GravityForm from "./lightbox/GravityForm"
import WpPostMedia from "./lightbox/WpPostMedia"
import CompletionScreen from "./lightbox/quiz-screen/CompletionScreen"
import QuizMedia from "./lightbox/QuizMedia"

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
  },
  async beforeDestroy() {
    await this.updateNodeProgress({
      id: this.nodeId,
      progress: this.node && this.node.typeData.progress[0].value,
    })
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
    async updateProgress(amountViewed) {
      this.updateNodeProgress({ id: this.nodeId, progress: amountViewed })
    },
    complete() {
      this.$emit("complete")
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

  &-embed {
    background: white;
  }

  &-no-scroll {
    overflow: hidden;
  }
}
</style>
