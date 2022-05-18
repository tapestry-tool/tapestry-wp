<template>
  <div>
    <h1 v-if="showTitle" class="wp-media-title">
      {{ node.title }}
      <completed-icon :node="node" class="mx-2" />
    </h1>
    <loading v-if="loading" />
    <div v-else class="article" :class="'context-' + context">
      <h1 class="article-title" v-html="title"></h1>
      <article v-html="content"></article>
    </div>
  </div>
</template>

<script>
import Loading from "@/components/common/Loading"
import CompletedIcon from "@/components/common/CompletedIcon"
import WordpressApi from "@/services/WordpressApi"

export default {
  name: "wp-post-media",
  components: {
    Loading,
    CompletedIcon,
  },
  props: {
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
  data() {
    return {
      loading: true,
      title: "",
      content: "",
    }
  },
  computed: {
    id() {
      return this.node.typeData.mediaURL
    },
    showTitle() {
      return (
        !this.hideTitle &&
        this.context === "multi-content" &&
        this.node.typeData.showTitle !== false
      )
    },
  },
  async mounted() {
    const post = await WordpressApi.getPostById(this.id)
    this.loading = false
    this.title = post.title
    this.content = post.content
    this.$emit("complete")
    this.$emit("load")
  },
}
</script>

<style lang="scss" scoped>
.article {
  text-align: left;

  &.context-lightbox {
    padding: 25px;

    .wp-media-title {
      padding-left: 25px;
    }
  }

  &-title {
    font-size: 1.75rem;
    font-weight: bold;
    margin: 1em 0;

    :before {
      display: none;
    }
  }

  article {
    font-family: "Source Sans Pro", sans-serif;
    font-size: 16px;
  }
}

.wp-media-title {
  text-align: left;
  margin: 0.9em 0 0.5em 0;
  font-weight: 500;
  font-size: 1.75rem;

  :before {
    display: none;
  }
}
</style>
