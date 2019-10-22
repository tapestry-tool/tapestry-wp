<template>
  <div class="external-media-container" :style="containerStyles">
    <iframe
      v-if="node.behaviour === 'embed'"
      id="external"
      frameborder="0"
      allowfullscreen="allowfullscreen"
      :src="node.typeData.mediaURL"
      :width="dimensions.width"
      :height="dimensions.height"
    ></iframe>
    <div v-if="fetching" class="spinners">
      <b-spinner
        type="grow"
        variant="secondary"
        small
        style="margin: 5px 5px 5px 20px;"
      ></b-spinner>
      <b-spinner
        type="grow"
        variant="primary"
        small
        style="margin: 5px;"
      ></b-spinner>
      <b-spinner type="grow" variant="danger" small style="margin: 5px;"></b-spinner>
    </div>
    <div v-else class="preview">
      <div
        class="preview-image"
        :style="{ 'background-image': `url(${linkMetadata.image})` }"
      >
        <a
          :href="node.typeData.mediaURL"
          target="blank"
          class="preview-image-link"
        ></a>
      </div>
      <div class="preview-content">
        <h1 class="preview-content-title">
          <a :href="node.typeData.mediaURL" target="blank">
            {{ linkMetadata.title }}
          </a>
        </h1>
        <p class="preview-content-description">{{ linkMetadata.description }}</p>
        <p class="preview-content-description">
          <a :href="node.typeData.mediaURL" target="blank">Open link</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { getLinkMetadata } from "../services/LinkPreviewApi"
import Helpers from "../utils/Helpers"

const MIN_MEDIA_WIDTH = 700
const MIN_MEDIA_HEIGHT = 500

export default {
  name: "external-media",
  props: {
    node: {
      type: Object,
      required: true,
    },
    dimensions: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      linkMetadata: {},
      error: null,
      fetching: false,
    }
  },
  computed: {
    shouldFetch() {
      if (!this.node.typeData.linkMetadata) {
        return true
      }
      const { url } = this.node.typeData.linkMetadata
      const mediaUrl = Helpers.normalizeUrl(this.node.typeData.mediaURL)
      if (!url.startsWith(mediaUrl)) {
        return true
      }
      return false
    },
    containerStyles() {
      const { width, height } = this.adjustedDimensions
      return {
        width: width + "px",
        height: height + "px",
      }
    },
    adjustedDimensions() {
      const width = Math.max(this.dimensions.width, MIN_MEDIA_WIDTH)
      const height = Math.max(this.dimensions.height, MIN_MEDIA_HEIGHT)
      const left =
        width === this.dimensions.width
          ? this.dimensions.left
          : this.dimensions.left - (MIN_MEDIA_WIDTH - this.dimensions.width) / 2
      return {
        width,
        height,
        left,
      }
    },
  },
  async mounted() {
    if (this.node.behaviour !== "embed") {
      if (this.shouldFetch) {
        this.fetchLinkData(this.node.typeData.mediaURL)
      } else {
        this.linkMetadata = this.node.typeData.linkMetadata
      }
    }
    this.$emit("mounted", this.adjustedDimensions)
  },
  methods: {
    async fetchLinkData(url) {
      this.fetching = true

      const { data, error } = await getLinkMetadata(url)
      this.fetching = false
      if (error) {
        this.error = error
      } else {
        this.linkMetadata = data
        this.$set(this.node.typeData, "linkMetadata", this.linkMetadata)

        let shouldChange = true
        if (this.node.imageURL) {
          shouldChange = confirm("Change thumbnail to new image?")
        }

        if (shouldChange) {
          this.$set(this.node, "imageURL", this.linkMetadata.image)
        }
        this.$emit("update-tapestry-node", this.node)
      }
    },
  },
}
</script>

<style scoped>
.spinners {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview {
  display: flex;
  height: 100%;
  width: 100%;
}

.preview-image {
  cursor: pointer;
  position: relative;
  flex: 1;
  height: auto;
  background-size: cover;
  background-position: center;
  transition: all 0.2s ease;
}

@media (min-width: 1000px) {
  .preview-image {
    flex: 2;
  }
}

.preview-image:hover {
  transform: scale(1.05);
}

.preview-image-link {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.preview-content {
  flex: 1;
  text-align: left;
  font-family: "Source Sans Pro", sans-serif;
  padding: 2em;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.preview-content-title {
  margin: 0;
  padding: 0;
  line-height: 1.1;
  font-weight: bold;
  font-family: inherit;
}

.preview-content-title:before {
  display: none;
}

.preview-content-description {
  margin: 0;
  margin-top: 1.5em;
  padding: 0;
  font-family: inherit;
}
</style>
