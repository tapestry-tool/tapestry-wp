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
  padding: 1em;
  background: rgb(238, 238, 238);
  text-align: left;
  min-height: 100%;

  h1 {
    font-size: 1.75rem;
    font-weight: 500;
    margin-bottom: 1em;

    :before {
      display: none;
    }
  }

  div {
    font-family: "Source Sans Pro", sans-serif;
    font-size: 16px;
    white-space: pre-wrap;
    margin: 0 auto;
  }
}
</style>

<style lang="scss">
.lightbox-text {
  padding: 0;
  margin-bottom: 1rem;
}
</style>
