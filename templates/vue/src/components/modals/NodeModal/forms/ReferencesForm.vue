<template>
  <div>
    <b-form-group label="References">
      <rich-text-form
        id="node-references"
        :value="value"
        @input="$emit('input', $event)"
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
    value: {
      type: String,
      required: true,
      default: "",
    },
  },
}
</script>
