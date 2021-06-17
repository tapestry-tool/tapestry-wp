<template>
  <b-form @submit="handleTextSubmit">
    <p>
      <b-form-textarea
        v-if="question.answerTypes.text.isMultiLine"
        v-model="text"
        rows="5"
      ></b-form-textarea>
      <b-form-input
        v-else
        v-model="text"
        :placeholder="question.answerTypes.text.placeholder"
      ></b-form-input>
      <b-form-invalid-feedback :state="isAnswerValid">
        Please enter a response.
      </b-form-invalid-feedback>
      <b-button class="mt-3 float-right" variant="primary" type="submit">
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
      this.text = newText
    },
    question() {
      this.text = this.answer.text
    },
  },
  methods: {
    handleTextSubmit(event) {
      event.preventDefault()
      this.isAnswerValid = this.answer.text !== ""
      if (this.isAnswerValid) {
        this.$emit("submit", this.answer.text)
      }
    },
  },
}
</script>
