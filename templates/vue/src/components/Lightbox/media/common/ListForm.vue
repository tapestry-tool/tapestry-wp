<template>
  <b-form @submit="handleTextSubmit">
    <b-form-input
      v-model="listAnswer"
      :placeholder="node.typeData.options.list.placeholder"
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
  name: "list-form",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      listAnswer: "",
      isAnswerValid: true,
    }
  },
  computed: {
    question() {
      return this.node.quiz[0]
    },
    listId() {
      return this.question.answers.listId
    },
  },
  mounted() {
    this.listAnswer = this.question.entries.listId
      ? this.question.entries.listId[this.listId]
      : ""
  },
  methods: {
    handleTextSubmit(event) {
      event.preventDefault()
      this.isAnswerValid = this.listAnswer !== ""
      if (this.isAnswerValid) {
        this.$emit("submit", this.listAnswer)
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
