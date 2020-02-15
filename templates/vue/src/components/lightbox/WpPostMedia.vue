<template>
  <loading v-if="loading" />
  <div v-else ref="post" class="article">
    <scrollbar :scroll-height="scrollHeight" :client-height="clientHeight" />
    <h1 class="article-title">{{ title }}</h1>
    <article v-html="content"></article>
  </div>
</template>

<script>
import Loading from "../Loading"
import WordpressApi from "../../services/WordpressApi"
import Scrollbar from "@/components/Scrollbar"

export default {
  name: "wp-post-media",
  components: {
    Loading,
    Scrollbar,
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
      scrollHeight: 0,
      clientHeight: 0,
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
    this.$emit("complete")
    this.$emit("load")

    this.$nextTick(() => {
      const post = this.$refs.post
      this.scrollHeight = post.scrollHeight
      this.clientHeight = post.clientHeight
    })
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
