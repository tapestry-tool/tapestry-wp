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
          <button
            class="btn btn-primary"
            variant="danger"
            @click="deleteAnswer(index)"
          >
            Delete
          </button>
        </ul>
      </div>
      <div class="input">
        <b-form-input
          v-model="userInput"
          class="textInput"
          :placeholder="
            question.answerTypes.list.placeholder
              ? question.answerTypes.list.placeholder
              : 'Enter text and press Enter'
          "
          @keydown.enter.prevent="addAnswer()"
        ></b-form-input>
        <b-button
          class="btn"
          variant="primary"
          data-qa="list-add-button"
          @click="addAnswer"
        >
          Add
        </b-button>
      </div>
      <div class="submission">
        <b-button class="submit-btn" variant="primary" @click="handleListSubmit">
          Submit
        </b-button>
      </div>
      <b-form-invalid-feedback :state="isAnswerValid">
        Please enter a response.
      </b-form-invalid-feedback>
      <b-form-invalid-feedback :state="isSubmitValid">
        Please enter at least one answer.
      </b-form-invalid-feedback>
    </div>
  </b-form>
</template>

<script>
export default {
  name: "list-question",
  props: {
    question: {
      type: Object,
      required: true,
    },
    answers: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      answerList: this.answers,
      isAnswerValid: true,
      isSubmitValid: true,
      userInput: "",
    }
  },
  watch: {
    userInput(newAnswer) {
      this.userInput = newAnswer
    },
  },
  methods: {
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
    addAnswer() {
      this.isAnswerValid = this.userInput !== ""
      if (this.isAnswerValid) {
        this.answerList.push(this.userInput)
      }
      this.userInput = ""
    },
    handleListSubmit(event) {
      event.preventDefault()
      this.isSubmitValid = this.answerList.length > 0
      if (this.isSubmitValid) {
        this.$emit("submit", this.answerList)
      }
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
  margin-top: 20px;
}
.answerItem {
  border-style: solid;
  border-radius: 6px;
  margin: 5px;
  padding: 10px 20px;
}
.list ul {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 10px;
  padding: 8px;
}
.list ul button {
  float: right;
  position: relative;
  padding: 20px;
  background-color: #f44336;
  height: 30px;
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.input {
  justify-content: center;
  align-items: center;
  margin-top: 30px;
}
.textInput {
  float: left;
  width: 85%;
}
.btn btn-primary {
  margin-top: 10px;
  margin-left: 30px;
  height: 30px;
  width: 100px;
  float: right;
}
.submit-btn {
  float: center;
  margin-top: 30px;
}
</style>
