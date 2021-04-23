<template>
  <b-form @submit="handleTextSubmit">
    <b-form-textarea
      v-if="node.typeData.options.text.multi"
      v-model="textAnswer"
      rows="5"
    ></b-form-textarea>
    <b-form-input
      v-else
      v-model="textAnswer"
      :placeholder="node.typeData.options.text.placeholder"
    ></b-form-input>

    <b-button
      v-if="node.mediaType === 'question'"
      class="submit-btn mt-3"
      variant="primary"
      type="submit"
    >
      Submit
    </b-button>
  </b-form>
</template>

<script>
export default {
  name: "text-form",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      textAnswer: "",
    }
  },
  methods: {
    handleTextSubmit() {
      this.$emit("submit", this.textAnswer)
    },
  },
}
</script>

<style lang="scss" scoped>
.submit-btn {
  float: right;
}
</style>
