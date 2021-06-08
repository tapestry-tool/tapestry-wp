<template>
  <b-form @submit="handleTextSubmit">
    <p>answerte is {{ answer }}</p>
    <p>text is {{ text }}</p>
    <p>multiLine is {{ multiLine }}</p>
    <p>
      <b-form-textarea v-if="multiLine" v-model="text" rows="5"></b-form-textarea>
      <b-form-input v-else v-model="text" :placeholder="placeholder"></b-form-input>
      <b-form-invalid-feedback :state="isAnswerValid">
        Please enter a response.
      </b-form-invalid-feedback>
      <b-button class="submit-btn mt-3" variant="primary" type="submit">
        Submit
      </b-button>
    </p>
  </b-form>
</template>

<script>
export default {
  name: "text-question",
  props: {
    question: {
      type: Object,
      required: true,
    },
    multiLine: {
      type: Boolean,
      required: false,
      default: false,
    },
    placeholder: {
      type: String,
      required: false,
      default: "",
    },
    answer: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isAnswerValid: true,
      text: this.answer.text,
    }
  },
  watch: {
    text(newText) {
      this.answer.text = newText
    },
  },
  methods: {
    handleTextSubmit(event) {
      event.preventDefault()
      this.isAnswerValid = this.text !== ""
      if (this.isAnswerValid) {
        this.$emit("submit", this.answer.text)
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
