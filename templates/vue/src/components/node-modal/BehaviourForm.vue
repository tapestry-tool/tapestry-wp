<template>
  <div id="modal-behaviour">
    <b-form-group>
      <b-form-checkbox
        v-if="node.mediaType !== 'accordion'"
        v-model="node.skippable"
        data-testid="node-behaviour-skippable"
      >
        Allow skipping video if user has not watched at least once
      </b-form-checkbox>
    </b-form-group>
  </div>
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
