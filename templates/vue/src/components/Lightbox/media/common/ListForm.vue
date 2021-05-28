<template>
  <b-form @submit="handleListSubmit">
    <header>Answers</header>
    <ul>
      <ul v-for="(answer, index) in answerList" :key="answer.index">
        <button @click="deleteAnswer(index)">X</button>
        {{
          answer
        }}
      </ul>
    </ul>
    <b-form-input
      v-model="listAnswer"
      :placeholder="
        node.typeData.options.list.placeholder
          ? node.typeData.options.list.placeholder
          : 'Enter text and press Enter'
      "
      @keypress.enter="addAnswer"
    ></b-form-input>
    <button @click="addAnswer">Add Answer</button>
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
      answerList: ["100"],
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
    handleListSubmit(event) {
      event.preventDefault()
      this.isAnswerValid = this.listAnswer !== ""
      if (this.isAnswerValid) {
        this.$emit("submit", this.listAnswer)
      }
    },
    addAnswer() {
      this.isAnswerValid = this.listAnswer !== ""
      if (this.isAnswerValid) {
        this.answerList.push(this.listAnswer)
      }
      this.listAnswer = ""
    },
    deleteAnswer(index) {
      this.answerList.splice(index, 1)
    },
  },
}
</script>

<style lang="scss" scoped>
.submit-btn {
  float: right;
}
</style>
