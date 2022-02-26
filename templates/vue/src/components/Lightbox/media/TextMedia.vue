<template>
  <article :class="'article context-' + context">
    <h1 v-if="showTitle">
      {{ node.title }}
      <completed-icon :node="node" class="mx-2" />
    </h1>
    <div v-html="content"></div>
  </article>
</template>

<script>
import CompletedIcon from "@/components/common/CompletedIcon"

export default {
  name: "text-media",
  components: {
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
  computed: {
    content() {
      const htmlContent = document.createElement("div")
      htmlContent.innerHTML += this.node.typeData.textContent

      htmlContent.querySelectorAll("a").forEach(link => {
        link.target = "_blank"
      })
      return String(htmlContent.innerHTML)
    },
    showTitle() {
      return (
        !this.hideTitle &&
        (this.context !== "multi-content" ||
          (this.context === "multi-content" &&
            this.node.typeData.showTitle !== false))
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
  text-align: left;
  min-height: 100%;

  &.context-lightbox {
    padding: 1em;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 500;
    text-align: left;
    margin-bottom: 1em;
  }

  div {
    font-family: "Source Sans Pro", sans-serif;
    font-size: 16px;
    white-space: pre-wrap;
    margin-bottom: 0.9em;
  }
}
</style>
