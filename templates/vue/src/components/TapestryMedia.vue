<template>
  <div
    :class="[
      'media-wrapper',
      { 'media-wrapper-embed': node.mediaFormat === 'embed' },
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
      :allow-end-screen="allowEndScreen"
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
      :allow-end-screen="allowEndScreen"
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
import { mapActions, mapGetters, mapMutations } from "vuex"
import TextMedia from "./lightbox/TextMedia"
import VideoMedia from "./lightbox/VideoMedia"
import ExternalMedia from "./lightbox/ExternalMedia"
import H5PMedia from "./lightbox/H5PMedia"
import GravityForm from "./lightbox/GravityForm"
import WpPostMedia from "./lightbox/WpPostMedia"
import CompletionScreen from "./lightbox/quiz-screen/CompletionScreen"
import QuizMedia from "./lightbox/QuizMedia"

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
    ...mapGetters(["getNode", "getDirectParents"]),
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
    ...mapActions(["completeNode", "updateNodeProgress", "updateH5pSettings"]),
    ...mapMutations(["updateTydeProgress"]),
    handleFormSubmit() {
      this.showCompletionScreen = true
      this.complete()
    },
    handleLoad(args) {
      this.$emit("load", args)
    },
    async updateProgress(type, amountViewed) {
      const now = new Date()
      const secondsDiff = Math.abs(
        (now.getTime() - this.timeSinceLastSaved.getTime()) / 1000
      )

      if (secondsDiff > SAVE_INTERVAL) {
        await this.updateNodeProgress({ id: this.nodeId, progress: amountViewed })
        if (type === "h5p") {
          await this.updateH5pSettings(this.h5pSettings)
        }
        this.timeSinceLastSaved = now
      }
    },
    async complete() {
      await this.completeNode(this.nodeId)
      this.$emit("complete")
      const stages = this.getDirectParents(this.nodeId).filter(
        id => this.getNode(id).tydeType === "Stage"
      )
      stages.map(sid =>
        this.updateTydeProgress({ parentId: sid, isParentModule: false })
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.media-wrapper {
  background: inherit;
  outline: none;
  border-radius: 15px;
  overflow: hidden;
  height: 100%;
}
.media-wrapper-embed {
  background: white;
}
</style>
