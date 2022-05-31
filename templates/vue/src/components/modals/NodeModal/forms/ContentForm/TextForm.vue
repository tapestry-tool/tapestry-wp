<template>
  <rich-text-form
    id="node-text-content"
    v-model="textContent"
    data-qa="node-text-content"
    placeholder="Enter text here"
  />
</template>

<script>
import RichTextForm from "./RichTextForm"

export default {
  components: {
    RichTextForm,
  },
  computed: {
    textContent: {
      get() {
        return this.$store.state.currentEditingNode.typeData.textContent
      },
      set(value) {
        this.$store.commit("setCurrentEditingNodeProperty", {
          property: "typeData.textContent",
          value,
        })
      },
    },
  },
  created() {
    if (!this.textContent) {
      this.textContent = ""
    }
  },
}
</script>
