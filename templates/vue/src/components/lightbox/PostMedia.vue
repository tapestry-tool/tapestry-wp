<template>
  <loading v-if="loading" />
  <div v-else class="article">
    <h1 class="article-title">{{ title }}</h1>
    <article v-html="content"></article>
  </div>
</template>

<script>
import Loading from "../Loading"
import WordpressApi from "../../services/WordpressApi"

export default {
  name: "post-media",
  components: {
    Loading,
  },
  props: {
    node: {
      type: Object,
      required: true,
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
  },
  async mounted() {
    const post = await WordpressApi.getPostById(this.id)
    this.loading = false
    this.title = post.title
    this.content = post.content
  },
}
</script>

<style lang="scss" scoped>
.article {
  padding: 25px;
  text-align: left;

  &-title {
    font-size: 1.75rem;
    font-weight: bold;
    margin: 1em 0;

    :before {
      display: none;
    }
  }

  article {
    color: #47425d;
    font-family: "Source Sans Pro", sans-serif;
    font-size: 16px;
  }
}
</style>
