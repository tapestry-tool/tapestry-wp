<template>
  <div>
    <b-form-group label="References">
      <rich-text-form
        id="node-references"
        v-model="node.references"
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
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
}
</script>
