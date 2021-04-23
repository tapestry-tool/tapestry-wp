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
    <b-form-invalid-feedback :state="isAnswerValid">
      Please enter a response.
    </b-form-invalid-feedback>

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
      isAnswerValid: true,
    }
  },
  methods: {
    handleTextSubmit() {
      this.isAnswerValid = this.textAnswer !== ""
      if (this.isAnswerValid) {
        this.$emit("submit", this.textAnswer)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.submit-btn {
  float: right;
}
</style>
