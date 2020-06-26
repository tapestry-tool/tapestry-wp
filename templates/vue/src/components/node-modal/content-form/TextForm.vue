<template>
  <b-form-group label="Text content">
    <b-form-textarea
      id="node-text-content"
      v-model="node.typeData.textContent"
      data-testid="node-textContent"
      placeholder="Enter text here"
    ></b-form-textarea>
  </b-form-group>
</template>

<script>
export default {
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
}
</script>
