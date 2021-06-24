<template>
  <div class="container">
    <div class="list">
      <ul
        v-for="(answer, index) in answerList"
        :key="answer.index"
        class="answerItem"
      >
        <b-form-input
          v-model="answerList[index]"
          :placeholder="
            question.answerTypes.list.placeholder
              ? question.answerTypes.list.placeholder
              : 'Enter text and press Enter'
          "
        ></b-form-input>
        <b-button
          :disabled="numOfFields >= maxFields"
          variant="primary"
          data-qa="list-add-button"
          :class="{
            'enabled btn-primary': !(numOfFields >= maxFields),
            disabled: numOfFields >= maxFields,
          }"
          @click="addAnswer"
          @keydown.enter.prevent="addAnswer"
        >
          +
        </b-button>
        <b-button
          :disabled="numOfFields <= minFields"
          :class="{
            'enabled btn-danger': !(numOfFields <= minFields),
            disabled: numOfFields <= minFields,
          }"
          @click="deleteAnswer(index)"
        >
          -
        </b-button>
      </ul>
    </div>
    <div class="submission">
      <b-button class="submit-btn" variant="primary" @click="handleListSubmit">
        Submit
      </b-button>
    </div>
  </div>
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
      required: true,
    },
  },
  data() {
    return {
      answerList: this.answers.map(x => x),
    }
  },
  computed: {
    minFields() {
      return parseInt(this.question.answerTypes.list.minFields, 10)
    },
    maxFields() {
      return this.question.answerTypes.list.maxFields.enabled
        ? parseInt(this.question.answerTypes.list.maxFields.value, 10)
        : 100000
    },
    numOfFields() {
      return this.answerList.length
    },
  },
  created() {
    if (this.answerList.length === 0) {
      for (let i = 0; i < this.minFields; i++) {
        this.addAnswer()
      }
    }
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
      this.answerList.push("")
    },
    handleListSubmit(event) {
      event.preventDefault()
      this.$emit("submit", this.answerList)
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
  padding: 4px;
}
.list ul button {
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
}

.enabled {
  background-color: white;
}

.disabled {
  outline: none;
  pointer-events: none;
}

.submit-btn {
  float: center;
  margin-top: 30px;
}
</style>
