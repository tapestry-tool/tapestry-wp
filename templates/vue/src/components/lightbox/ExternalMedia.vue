<template>
  <div class="external-media-container" :style="containerStyles">
    <iframe
      v-if="node.behaviour === 'embed'"
      id="external"
      frameborder="0"
      allowfullscreen="allowfullscreen"
      :src="normalizedUrl"
      :width="dimensions.width"
      :height="dimensions.height"
    ></iframe>
    <div v-else class="preview">
      <div
        class="preview-image"
        :style="{ 'background-image': `url(${node.typeData.linkMetadata.image})` }"
      >
        <a :href="node.typeData.mediaURL" target="blank"></a>
      </div>
      <div class="preview-content">
        <h1>
          <a :href="node.typeData.mediaURL" target="blank">
            {{ node.typeData.linkMetadata.title }}
          </a>
        </h1>
        <p>{{ node.typeData.linkMetadata.description }}</p>
        <p>
          <a :href="node.typeData.mediaURL" target="blank">Open link</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Helpers from "../../utils/Helpers"

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
  computed: {
    normalizedUrl() {
      return Helpers.normalizeUrl(this.node.typeData.mediaURL)
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
    this.$emit("mounted", this.adjustedDimensions)
    this.$emit("complete")
  },
}
</script>

<style lang="scss" scoped>
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

  .preview-image {
    cursor: pointer;
    position: relative;
    flex: 1;
    height: auto;
    background-size: cover;
    background-position: center;
    transition: all 0.2s ease;

    @media (min-width: 1000px) {
      flex: 2;
    }

    &:hover {
      transform: scale(1.05);
    }

    a {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }

  .preview-content {
    flex: 1;
    text-align: left;
    font-family: "Source Sans Pro", sans-serif;
    padding: 2em;
    display: flex;
    flex-direction: column;
    justify-content: center;

    h1 {
      margin: 0;
      padding: 0;
      line-height: 1.1;
      font-weight: bold;
      font-family: inherit;

      &:before {
        display: none;
      }
    }

    p {
      margin: 0;
      margin-top: 1.5em;
      padding: 0;
      font-family: inherit;
    }
  }
}
</style>
