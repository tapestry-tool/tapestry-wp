<template>
  <div>
    <h1 v-if="showTitle" class="external-media-title external-page-style">
      {{ node.title }}
    </h1>
    <div class="external-media-container w-100 h-100">
      <iframe
        v-if="node.behaviour === 'embed'"
        id="external"
        frameborder="0"
        allowfullscreen="allowfullscreen"
        :src="normalizedUrl"
        :style="'min-height:' + dimensions.height + 'px'"
        @load="$emit('load')"
      ></iframe>
      <b-container v-else class="preview w-100 h-100" :style="previewStyles">
        <b-row align-v="center" class="w-100 h-100">
          <b-col class="w-50">
            <a :href="node.typeData.mediaURL" target="blank">
              <img
                class="preview-image"
                :src="`${node.typeData.linkMetadata.image}`"
              />
            </a>
          </b-col>
          <b-col class="preview-content w-50">
            <h1>
              <a :href="node.typeData.mediaURL" target="blank">
                {{ node.typeData.linkMetadata.title }}
              </a>
            </h1>
            <p>{{ node.typeData.linkMetadata.description }}</p>
            <p>
              <a :href="node.typeData.mediaURL" target="blank">Open link</a>
            </p>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
import Helpers from "@/utils/Helpers"

export default {
  name: "external-media",
  props: {
    dimensions: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    node: {
      type: Object,
      required: true,
    },
    context: {
      type: String,
      required: false,
      default: "",
    },
  },
  computed: {
    normalizedUrl() {
      return Helpers.normalizeUrl(this.node.typeData.mediaURL)
    },
    previewStyles() {
      const { height } = this.dimensions
      if (height) {
        return {
          maxHeight: `${height - 32}px`,
        }
      }
      return {}
    },
    showTitle() {
      return this.context === "page" && this.node.typeData.showTitle !== false
    },
  },
  mounted() {
    this.$emit("complete")
    if (this.node.behaviour !== "embed") {
      this.$emit("load")
    }
  },
}
</script>

<style lang="scss" scoped>
.external-media-container {
  height: 100%;
}

.preview {
  .preview-image {
    width: 100%;
    cursor: pointer;
    position: relative;
    background-size: cover;
    background-position: center;
    transition: all 0.2s ease;

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
    text-align: left;
    font-family: "Source Sans Pro", sans-serif;

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
      margin-top: 1em;
      padding: 0;
      font-family: inherit;
    }
  }
}

#external {
  width: 100%;
  height: 100%;
}

.external-page-style {
  text-align: left;
  margin-bottom: 0.9em;
}

.external-media-title {
  color: white;
  font-weight: 500;
  font-size: 1.75rem;

  :before {
    display: none;
  }
}
</style>
