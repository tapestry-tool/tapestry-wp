<template>
  <div>
    <b-form-group label="References">
      <b-form-textarea
        id="node-references"
        v-model="node.references"
        data-testid="node-references"
        placeholder="Enter your references here"
      ></b-form-textarea>
    </b-form-group>
    <b-form-group label="Copyright/Licensing">
      <b-form-textarea
        id="node-license"
        v-model="node.license"
        data-testid="node-license"
        placeholder="Enter your license information here"
      ></b-form-textarea>
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
