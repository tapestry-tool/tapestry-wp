<template>
  <b-form class="grid-container" @submit="handleTextSubmit">
    <p class="form-input">
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
      type: [Array, String],
      required: true,
    },
  },
  data() {
    return {
      isAnswerValid: true,
      text: "",
    }
  },
  watch: {
    text(newText) {
      this.text = newText
    },
    question() {
      this.text = this.answer
    },
  },
  created() {
    if (Array.isArray(this.answer)) {
      this.text = this.answer[0]
    } else {
      this.text = this.answer
    }
  },
  methods: {
    handleTextSubmit(event) {
      event.preventDefault()
      this.isAnswerValid = this.text !== ""
      if (this.isAnswerValid) {
        this.$emit("submit", this.text)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.grid-container {
  display: grid;
  align-content: center;
  height: 250px;
}
</style>
