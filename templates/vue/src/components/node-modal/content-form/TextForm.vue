<template>
  <rich-text-form
    id="node-text-content"
    v-model="node.typeData.textContent"
    data-testid="node-textContent"
    placeholder="Enter text here"
  />
</template>

<script>
import RichTextForm from "./RichTextForm"

export default {
  components: {
    RichTextForm,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  created() {
    if (!this.node.typeData.textContent) {
      this.node.typeData.textContent = ""
    }
  },
}
</script>
