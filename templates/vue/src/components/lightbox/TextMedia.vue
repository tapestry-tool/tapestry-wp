<template>
  <article class="article">
    <h1>{{ node.title }}</h1>
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
  },
  computed: {
    content() {
      return this.node.typeData.textContent
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
  padding: 0 1em 1em;
  text-align: left;

  h1 {
    font-size: 1.75rem;
    font-weight: 500;
    margin: 1em auto;
    max-width: 960px;

    :before {
      display: none;
    }
  }

  div {
    font-family: "Source Sans Pro", sans-serif;
    font-size: 16px;
    white-space: pre-wrap;
    max-width: 960px;
    margin: 0 auto 1em;
  }
}
</style>

<style lang="scss">
.lightbox-text {
  padding: 0;
  margin-bottom: 1rem;
}
</style>
