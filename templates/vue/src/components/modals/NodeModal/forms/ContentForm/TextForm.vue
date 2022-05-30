<template>
  <rich-text-form
    id="node-text-content"
    :value="node.typeData.textContent"
    @input="$emit('property-change', 'typeData.textContent', $event)"
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
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  created() {
    if (!this.node.typeData.textContent) {
      this.$emit("property-change", "typeData.textContent", "")
    }
  },
}
</script>
