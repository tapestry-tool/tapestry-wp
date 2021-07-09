<template>
  <b-form class="grid-container">
    <ul v-if="question.answerTypes.text.allowMultiple" class="list">
      <li
        v-for="(answerItem, index) in textAnswers"
        :key="index"
        class="answerItem"
        data-qa="list-input-list"
      >
        <b-form-input
          v-model="textAnswers[index]"
          :data-qa="`list-input-${index}`"
          :placeholder="
            question.answerTypes.text.placeholder
              ? question.answerTypes.text.placeholder
              : 'Type an answer and press Enter'
          "
          autofocus
          @keydown.enter="addAnswer"
        ></b-form-input>
        <b-button
          v-show="numOfAnswers < maxFields"
          variant="primary"
          :data-qa="`list-add-${index}`"
          @click="addAnswer"
        >
          +
        </b-button>
        <b-button
          v-show="numOfAnswers > minFields"
          variant="danger"
          :data-qa="`list-del-${index}`"
          @click="deleteAnswer(index)"
        >
          -
        </b-button>
      </li>
    </ul>
    <b-form-textarea
      v-else-if="question.answerTypes.text.isMultiLine"
      v-model="textAnswers[0]"
      rows="5"
    ></b-form-textarea>
    <b-form-input
      v-else
      v-model="textAnswers[0]"
      :placeholder="question.answerTypes.text.placeholder"
    ></b-form-input>
    <b-form-invalid-feedback :state="isAnswerValid">
      Please enter a response for all inputs.
    </b-form-invalid-feedback>
    <div>
      <b-button class="submit-btn" variant="primary" @click="handleTextSubmit">
        Submit
      </b-button>
    </div>
  </b-form>
</template>

<script>
const MAX_FIELDS_ALLOWED = 100
export default {
  name: "text-question",
  props: {
    question: {
      type: Object,
      required: true,
    },
    answer: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isAnswerValid: true,
      textAnswers: this.answer.map(x => x),
    }
  },
  computed: {
    minFields() {
      return parseInt(this.question.answerTypes.text.list.minFields, 10)
    },
    maxFields() {
      return this.question.answerTypes.text.list.maxFields.enabled
        ? parseInt(this.question.answerTypes.text.list.maxFields.value, 10)
        : MAX_FIELDS_ALLOWED
    },
    numOfAnswers() {
      return this.textAnswers.length
    },
  },
  created() {
    if (this.question.answerTypes.text.allowMultiple) {
      for (let i = this.numOfAnswers; i < this.minFields; i++) {
        this.addAnswer()
      }
    }
    if (this.answer.length > 1 && !this.question.answerTypes.text.allowMultiple) {
      this.textAnswers = []
      this.textAnswers.push(this.answer.join())
    }
  },
  methods: {
    handleTextSubmit(event) {
      event.preventDefault()
      this.isAnswerValid = this.textAnswers.every(answer => answer !== "")
      if (this.isAnswerValid) {
        this.$emit("submit", this.textAnswers)
      }
    },
    deleteAnswer(index) {
      this.$bvModal
        .msgBoxConfirm("This answer will be removed.", {
          modalClass: "node-modal-confirmation",
          title: "Are you sure you want to delete this answer from the list?",
          okTitle: "Yes, delete!",
          okVariant: "danger",
        })
        .then(close => {
          if (close) {
            this.textAnswers.splice(index, 1)
          }
        })
        .catch(err => console.log(err))
    },
    addAnswer() {
      if (this.numOfAnswers < this.maxFields) {
        this.textAnswers.push("")
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.grid-container {
  display: grid;
  align-content: center;
}
.answerItem {
  display: flex;
  border-style: solid;
  border-radius: 6px;
  padding: 10px 20px;
  margin-top: 5px;
}
.list li button {
  float: right;
  position: relative;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  width: 50px;
  float: right;
  font-size: 30px;
  font-weight: bold;
  margin-left: 3px;
  margin-right: 3px;
}
.submit-btn {
  float: right;
  margin-top: 30px;
  width: 15%;
}
</style>
