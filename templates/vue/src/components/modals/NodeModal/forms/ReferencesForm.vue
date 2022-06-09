<template>
  <div>
    <b-form-group label="References">
      <rich-text-form
        id="node-references"
        v-model="references"
        data-testid="node-references"
        placeholder="Enter your references here"
      ></rich-text-form>
    </b-form-group>
  </div>
</template>

<script>
import RichTextForm from "./ContentForm/RichTextForm"

export default {
  components: {
    RichTextForm,
  },
  computed: {
    references: {
      get() {
        return this.$store.state.currentEditingNode.references
      },
      set(value) {
        this.$store.commit("setCurrentEditingNodeProperty", {
          property: "references",
          value,
        })
      },
    },
  },
}
</script>
