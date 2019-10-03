<template>
  <article>
    <h1 id="text-light-box-title">{{ title }}</h1>
    <div id="text-light-box-paragraph" v-html="html"></div>
  </article>
</template>

<script>
export default {
  name: 'text-media',
  props: {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: false,
      default: '',
    },
  },
  computed: {
    html() {
      let htmlText = ''
      const paragraphs = this.content.split('\n\n')
      paragraphs.forEach(text => {
        htmlText += `<p>${text.replace('\n', '<br>')}</p>`
      })
      return htmlText
    }
  }
}
</script>

<style scoped>

</style>
