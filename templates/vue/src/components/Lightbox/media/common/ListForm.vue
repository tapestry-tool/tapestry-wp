<template>
  <b-form>
    <div class="container">
      <div class="list">
        <ul
          v-for="(answer, index) in answerList"
          :key="answer.index"
          class="answerItem"
        >
          {{
            answer
          }}
          <button class="delete-button" @click="deleteAnswer(index)">
            Delete
          </button>
        </ul>
      </div>
      <b-form-input
        v-model="listAnswer"
        class="textInput"
        :placeholder="
          node.typeData.options.list.placeholder
            ? node.typeData.options.list.placeholder
            : 'Enter text and press Enter'
        "
        @keypress.enter="addAnswer"
      ></b-form-input>
      <button class="add-button" @click="addAnswer">Add</button>
      <b-form-invalid-feedback :state="isAnswerValid">
        Please enter a response.
      </b-form-invalid-feedback>
      <b-form-invalid-feedback :state="isSubmitValid">
        Please enter at least one answer.
      </b-form-invalid-feedback>

      <b-button
        v-if="node.mediaType === 'question'"
        class="submit-btn mt-3"
        variant="primary"
        @click="handleListSubmit"
      >
        Submit
      </b-button>
    </div>
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
      isSubmitValid: true,
      answerList: [],
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
    if (this.question.hasOwnProperty("entries")) {
      if (
        this.question.entries.hasOwnProperty("listId") &&
        this.question.entries.listId !== null
      ) {
        this.answerList = this.question.entries.listId[this.listId]
      }
    } else {
      this.answerList = []
    }
  },
  methods: {
    handleListSubmit(event) {
      event.preventDefault()
      this.isSubmitValid = this.answerList.length > 0
      if (this.isSubmitValid) {
        this.$emit("submit", this.answerList)
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
      this.$bvModal
        .msgBoxConfirm("This answer will be removed.", {
          modalClass: "node-modal-confirmation",
          title: "Are you sure you want to delete this answer?",
          okTitle: "Yes, delete!",
          okVariant: "danger",
        })
        .then(close => {
          if (close) {
            this.answerList.splice(index, 1)
          }
        })
        .catch(err => console.log(err))
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  justify-content: center;
  align-items: center;
}
.list {
  position: relative;
  background-color: gray;
}
.list ul {
  position: relative;
  padding: 20px;
}

.textInput {
  margin-right: 30px;
}
.submit-btn {
  float: right;
}
.add-button {
  margin-top: 10px;
  margin-left: 30px;
  float: right;
}
.delete-button {
  float: right;
  background-color: #f44336;
  height: 30px;
  width: 100px;
  text-align: center;
  display: block;
  border-radius: 5px;
  padding-bottom: 20px;
  display: flex;
  margin: auto;
}

.answerItem {
  border-style: solid;
  border-radius: 6px;
  margin: 5px;
  padding: 10px 20px;
  border-left: 5px solid green;
}
</style>
