<template>
  <article :class="'article context-' + context">
    <h1 v-if="showTitle">{{ node.title }}</h1>
    <div v-html="content"></div>
  </article>
</template>

<script>
export default {
  name: "text-media",
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
  },
  computed: {
    content() {
      return this.node.typeData.textContent
    },
    showTitle() {
      return (
        this.context !== "page" ||
        (this.context === "page" && this.node.typeData.showTitle !== false)
      )
    },
  },
  mounted() {
    this.$emit("complete")
    this.$emit("load")
  },
}
</script>

<style lang="scss" scoped>
.article {
  color: #111;
  padding: 1em;
  text-align: left;
  min-height: 100%;

  h1 {
    font-size: 1.75rem;
    font-weight: 500;
    text-align: left;
    margin-bottom: 1em;

    :before {
      display: none;
    }
  }

  div {
    font-family: "Source Sans Pro", sans-serif;
    font-size: 16px;
    white-space: pre-wrap;
    margin-bottom: 0.9em;
  }
}
</style>
