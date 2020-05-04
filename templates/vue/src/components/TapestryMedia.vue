<template>
  <div
    :class="[
      'media-wrapper',
      { 'media-wrapper-embed': node.mediaFormat === 'embed' },
    ]"
  >
    <text-media
      v-if="node.mediaType === 'text'"
      :node="node"
      @complete="complete"
      @load="handleLoad"
    />
    <video-media
      v-if="node.mediaFormat === 'mp4' && youtubeVideoId === ''"
      :autoplay="autoplay"
      :node="node"
      :dimensions="dimensions"
      @load="handleLoad"
      @complete="complete"
      @timeupdate="updateProgress"
      @close="$emit('close')"
    />
    <youtube-media
      v-if="youtubeVideoId !== ''"
      :autoplay="autoplay"
      :node="node"
      :dimensions="dimensions"
      :youtubeId="youtubeVideoId"
      @load="handleLoad"
      @complete="complete"
      @timeupdate="updateProgress"
      @close="$emit('close')"
    />
    <external-media
      v-if="node.mediaType === 'url-embed'"
      :node="node"
      :dimensions="dimensions"
      @mounted="handleLoad"
      @complete="complete"
    />
    <h5p-media
      v-if="node.mediaFormat === 'h5p'"
      :autoplay="autoplay"
      :node="node"
      :width="dimensions.width"
      :height="dimensions.height"
      :settings="h5pSettings"
      @load="handleLoad"
      @update-settings="updateH5pSettings"
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
      @complete="completeNode(nodeId)"
      @load="handleLoad"
    ></wp-post-media>
    <quiz-media
      v-if="node.mediaType === 'activity'"
      :node="node"
      @complete="completeNode(nodeId)"
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
import YoutubeMedia from "./lightbox/YoutubeMedia"

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
    h5pSettings: {
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
      showCompletionScreen: false,
      timeSinceLastSaved: new Date(),
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
    node() {
      return this.getNode(this.nodeId)
    },
    youtubeVideoId(){
      const linkRegex = /(?:youtube\.com\/\S*(?:(?:e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/
      const matchArray = this.node.typeData.mediaURL.match(linkRegex) 
      return matchArray === null ? '' : matchArray[1]
    }
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
}
.media-wrapper-embed {
  background: white;
}
</style>
