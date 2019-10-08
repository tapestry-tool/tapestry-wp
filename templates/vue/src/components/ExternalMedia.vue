<template>
  <div class="external-media-container">
    <iframe
      v-if="node.behaviour === 'embed'"
      id="external"
      frameborder="0"
      allowfullscreen="allowfullscreen"
      :src="node.typeData.mediaURL"
      :width="width"
      :height="height"
    >
    </iframe>
    <div v-else class="preview">
      <div class="preview-image" :style="{ 'background-image': `url(${linkMetadata.image})` }">
        <a :href="node.typeData.mediaURL" target="blank" class="preview-image-link"></a>
      </div>
      <div class="preview-content">
        <h1 class="preview-content-title">
          <a :href="node.typeData.mediaURL" target="blank">{{ linkMetadata.title }}</a>
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
import { getLinkMetadata } from '../services/LinkPreviewApi'

export default {
  name: 'external-media',
  props: ['node', 'width', 'height'],
  data() {
    return {
      linkMetadata: {},
      error: null
    }
  },
  async mounted() {
    if (this.node.behaviour !== 'embed') {
      if (this.node.typeData.linkMetadata) {
        this.linkMetadata = this.node.typeData.linkMetadata
      } else {
        const { data, error } = await getLinkMetadata(this.node.typeData.mediaURL)
        if (error) {
          this.error = error
        } else {
          this.linkMetadata = data
          this.$set(this.node.typeData, 'linkMetadata', this.linkMetadata)
          this.$emit('update-tapestry-node', this.node)
        }
      }
    }
  }
}
</script>

<style scoped>
.external-media-container {
  width: 100%;
  height: 100%;
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
