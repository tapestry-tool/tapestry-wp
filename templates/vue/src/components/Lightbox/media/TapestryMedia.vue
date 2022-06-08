<template>
  <div
    :class="[
      'media-wrapper',
      `context-${context}`,
      { 'media-wrapper-embed': node.mediaFormat === 'embed' },
      {
        'media-wrapper-no-scroll':
          node.mediaFormat === 'mp4' ||
          node.mediaFormat === 'kaltura' ||
          node.mediaFormat === 'h5p' ||
          node.mediaFormat === 'youtube',
      },
    ]"
    @mouseenter="setHovered"
  >
    <text-media
      v-if="node.mediaType === 'text'"
      :node="node"
      :context="context"
      :hide-title="hideTitle"
      @complete="complete"
      @load="handleLoad"
    />
    <video-media
      v-if="isVideoNode"
      :dimensions="dimensions"
      :context="context"
      :node-id="nodeId"
      :hide-title="hideTitle"
      @change:dimensions="$emit('change:dimensions', $event)"
      @load="handleLoad"
      @update-progress="updateProgress"
      @complete="complete"
      @close="$emit('close')"
    />
    <h5p-media
      v-if="node.mediaType === 'h5p' && !isVideoNode"
      :dimensions="dimensions"
      :context="context"
      :node="node"
      :hide-title="hideTitle"
      @change:dimensions="$emit('change:dimensions', $event)"
      @load="handleLoad"
      @complete="complete"
      @close="$emit('close')"
    />
    <external-media
      v-if="node.mediaType === 'url-embed'"
      :dimensions="dimensions"
      :node="node"
      :context="context"
      :hide-title="hideTitle"
      @change:dimensions="$emit('change:dimensions', $event)"
      @load="handleLoad"
      @complete="complete"
    />
    <wp-post-media
      v-if="node.mediaType === 'wp-post'"
      :node="node"
      :context="context"
      :hide-title="hideTitle"
      @complete="complete"
      @load="handleLoad"
    ></wp-post-media>
    <activity-media
      v-if="node.mediaType === 'activity' || node.mediaType === 'answer'"
      :dimensions="dimensions"
      :node="node"
      :context="context"
      :initial-type="node.mediaType"
      :hide-title="hideTitle"
      @change:dimensions="$emit('change:dimensions', $event)"
      @complete="complete"
      @close="$emit('close')"
      @load="handleLoad"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import TextMedia from "./TextMedia"
import VideoMedia from "./VideoMedia"
import H5PMedia from "./H5PMedia"
import ExternalMedia from "./ExternalMedia"
import ActivityMedia from "./ActivityMedia"
import WpPostMedia from "./WpPostMedia"

export default {
  name: "tapestry-media",
  components: {
    TextMedia,
    VideoMedia,
    "h5p-media": H5PMedia,
    ExternalMedia,
    WpPostMedia,
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
    hideTitle: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      timeSinceLastSaved: new Date(),
      lastHoveredRowId: null,
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
    node() {
      return this.getNode(this.nodeId)
    },
    isVideoNode() {
      if (this.node.mediaType === "h5p" || this.node.mediaFormat === "h5p") {
        if (this.node.typeData.h5pMeta.library === "H5P.InteractiveVideo") {
          return true
        }
      }
      return ["mp4", "youtube", "kaltura"].includes(this.node.mediaFormat)
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
    setHovered() {
      this.$router.push({
        ...this.$route,
        params: {
          ...this.$route.params,
          rowId: this.nodeId,
        },
        query: this.$route.query,
      })
      this.lastHoveredRowId = this.nodeId
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
  outline: none;
  overflow: auto;
  height: 100%;
  widows: 100%;
  padding: 0;

  &:not(.context-multi-content) {
    border-radius: 15px;
  }

  &-no-scroll {
    overflow: hidden;
  }

  &-embed {
    background: var(--background-color);
  }
}
</style>
