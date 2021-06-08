<template>
  <b-form @submit="handleTextSubmit">
    <p>answer is {{ answer }}</p>
    <p>
      <b-form-textarea
        v-if="multiLine"
        v-model="answer.text"
        rows="5"
      ></b-form-textarea>
      <b-form-input
        v-else
        v-model="answer.text"
        :placeholder="placeholder"
      ></b-form-input>
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
    }
  },
  methods: {
    handleTextSubmit(event) {
      event.preventDefault()
      this.$emit("submit", this.answer)
    },
  },
}
</script>

<style lang="scss" scoped>
.submit-btn {
  float: right;
}
</style>
