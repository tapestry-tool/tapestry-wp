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
  },
}
</script>

<style lang="scss" scoped>
.article {
  padding: 0 15px;
  text-align: left;

  h1 {
    font-size: 1.75rem;
    font-weight: 500;
    margin: 1em 0;

    :before {
      display: none;
    }
  }

  div {
    color: #47425d;
    font-family: "Source Sans Pro", sans-serif;
    font-size: 16px;
    white-space: pre;
  }
}
</style>

<style lang="scss">
.lightbox-text {
  padding: 0;
  margin-bottom: 1rem;
}
</style>
