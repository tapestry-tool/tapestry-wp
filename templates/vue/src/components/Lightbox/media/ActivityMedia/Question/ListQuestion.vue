<template>
  <div class="container">
    <ul class="list">
      <li v-for="(answerItem, index) in answerList" :key="index" class="answerItem">
        <b-form-input
          v-model="answerList[index]"
          :data-qa="`list-input-${index}`"
          :placeholder="
            question.answerTypes.text.placeholder
              ? question.answerTypes.text.placeholder
              : 'Type an answer and press Enter'
          "
        ></b-form-input>
        <b-button
          v-show="numOfFields < maxFields"
          variant="primary"
          :data-qa="`list-add-${index}`"
          @click="addAnswer"
          @keydown.enter="enterPress"
        >
          +
        </b-button>
        <b-button
          v-show="numOfFields > minFields"
          variant="danger"
          :data-qa="`list-del-${index}`"
          @click="deleteAnswer(index)"
        >
          -
        </b-button>
      </li>
    </ul>
    <div class="submission">
      <b-button
        class="submit-btn"
        data-qa="list-submit-btn"
        variant="primary"
        @click="handleListSubmit"
      >
        Submit
      </b-button>
    </div>
  </div>
</template>

<script>
const MAX_FIELDS_ALLOWED = 100

export default {
  name: "list-question",
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
      // answerList: this.answer.map(x => x),
      answerList: [],
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
    numOfFields() {
      return this.answerList.length
    },
  },
  // beforeDestroy() {
  //   // this.removeEventListener("keydown", e => {
  //   //   this.enterPress(e)
  //   // })
  //   // console.log("removed event listender")
  // },
  // mounted() {
  // 	// console.log(this)
  //   // this.addEventListener("keydown", e => {
  //   //   this.enterPress(e)
  //   // })
  // },
  created() {
    for (let i = this.numOfFields; i < this.minFields; i++) {
      this.addAnswer()
    }
    if (Array.isArray(this.answer)) {
      for (let i = 0; i < this.answer.length; i++) {
        this.answerList[i] = this.answer[i]
      }
    } else {
      this.answerList[0] = this.answer
    }
  },
  methods: {
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
            this.answerList.splice(index, 1)
          }
        })
        .catch(err => console.log(err))
    },
    addAnswer() {
      this.answerList.push("")
    },
    enterPress(e) {
      if (e.key === "Enter") {
        this.addAnswer()
      }
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
  float: center;
  margin-top: 30px;
}
</style>
