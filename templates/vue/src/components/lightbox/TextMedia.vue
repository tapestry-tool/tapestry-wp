<template>
  <article class="article">
    <h1>{{ node.title }}</h1>
    <div v-html="html"></div>
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
    html() {
      const content = this.node.typeData.textContent
      let htmlText = ""
      const paragraphs = content.split("\n\n")
      paragraphs.forEach(text => {
        htmlText += `<p class="lightbox-text">${text.replace("\n", "<br>")}</p>`
      })
      return htmlText
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
  }
}
</style>

<style lang="scss">
.lightbox-text {
  padding: 0;
  margin-bottom: 1rem;
}
</style>
