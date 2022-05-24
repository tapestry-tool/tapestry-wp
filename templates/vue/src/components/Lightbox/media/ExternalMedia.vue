<template>
  <div class="h-100">
    <h1 v-if="showTitle" class="external-media-title external-page-style">
      {{ node.title }}
      <completed-icon :node="node" class="mx-2" />
    </h1>
    <div class="external-media-container w-100 h-100">
      <iframe
        v-if="node.behaviour === 'embed'"
        id="external"
        frameborder="0"
        allowfullscreen="allowfullscreen"
        :src="normalizedUrl"
        :style="'min-height:' + dimensions.height + 'px'"
        @load="handleLoad"
      ></iframe>
      <b-card
        v-else
        ref="preview"
        no-body
        :img-src="showVertically ? node.typeData.linkMetadata.image : ''"
        class="preview overflow-hidden w-100"
      >
        <b-row :no-gutters="showVertically">
          <b-col
            v-if="!showVertically"
            md="6"
            class="preview-image"
            :style="{
              'background-image': `url(${node.typeData.linkMetadata.image})`,
            }"
          >
            <a href="#" @click.prevent="openLink"></a>
          </b-col>
          <b-col :md="showVertically ? 12 : 6" class="preview-content">
            <b-card-body>
              <b-card-text>
                <component
                  :is="node.typeData.linkMetadata.title.length < 20 ? 'h2' : 'h3'"
                  class="mb-3"
                >
                  <a href="#" @click.prevent="openLink">
                    {{ node.typeData.linkMetadata.title }}
                  </a>
                </component>
                <p>{{ node.typeData.linkMetadata.description }}</p>
                <p>
                  <b-button variant="primary" @click.prevent="openLink">
                    Open link
                    <i class="fas fa-external-link-alt ml-1"></i>
                  </b-button>
                </p>
              </b-card-text>
            </b-card-body>
          </b-col>
        </b-row>
      </b-card>
    </div>
  </div>
</template>

<script>
import CompletedIcon from "@/components/common/CompletedIcon"
import Helpers from "@/utils/Helpers"

export default {
  name: "external-media",
  components: {
    CompletedIcon,
  },
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
    hideTitle: {
      type: Boolean,
      required: false,
      default: false,
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
      return (
        !this.hideTitle &&
        this.context === "multi-content" &&
        this.node.typeData.showTitle !== false
      )
    },
    showVertically() {
      return this.node.typeData.halfWidth && this.context !== "lightbox"
    },
  },
  mounted() {
    if (this.node.behaviour !== "embed") {
      this.handleLoad()
    }
  },
  methods: {
    handleLoad() {
      this.$emit("load")
      if (this.node.behaviour === "embed") {
        this.$emit("complete")
      } else {
        this.$emit("change:dimensions", {
          height: this.$refs.preview.clientHeight,
        })
      }
    },
    openLink() {
      this.$emit("complete")
      window.open(this.node.typeData.mediaURL, "_blank")
    },
  },
}
</script>

<style lang="scss" scoped>
.external-media-container {
  height: 100%;

  .preview {
    border-radius: 15px;

    .preview-image {
      cursor: pointer;
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
      background: #fff;
      text-align: left;
      min-height: 300px;

      .btn i {
        opacity: 0.5;
      }
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
  font-weight: 500;
  font-size: 1.75rem;

  :before {
    display: none;
  }
}
</style>
