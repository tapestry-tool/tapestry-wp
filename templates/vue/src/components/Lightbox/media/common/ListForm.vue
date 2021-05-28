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
          v-model="listAnswer"
          class="textInput"
          :placeholder="
            node.typeData.options.list.placeholder
              ? node.typeData.options.list.placeholder
              : 'Enter text and press Enter'
          "
          @keypress.enter="addAnswer"
        ></b-form-input>
        <b-button class="btn" variant="primary" @click="addAnswer">
          Add
        </b-button>
      </div>
      <div class="submission">
        <b-button
          v-if="node.mediaType === 'question'"
          class="submit-btn"
          variant="primary"
          @click="handleListSubmit"
        >
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
  width: 90%;
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
