<template>
  <b-form class="container" @submit="handleMultipleChoiceSubmit">
    <b-form-group v-if="question.answerTypes.multipleChoice.hasMultipleAnswers">
      <b-form-checkbox-group v-model="userSelectedCheckbox">
        <user-choice-row
          v-for="userChoiceRow in question.answerTypes.multipleChoice.checkboxArray"
          :key="userChoiceRow.id"
          :item="userChoiceRow"
          :isCheckBox="question.answerTypes.multipleChoice.hasMultipleAnswers"
          :hasImage="question.answerTypes.multipleChoice.useImages"
          :data-qa="`user-choicerow-checkbox-${userChoiceRow.id}`"
        ></user-choice-row>
      </b-form-checkbox-group>
    </b-form-group>

    <b-form-group v-else>
      <b-form-radio-group v-model="userSelectedRadio">
        <user-choice-row
          v-for="userChoiceRow in question.answerTypes.multipleChoice.radioArray"
          :key="userChoiceRow.id"
          :item="userChoiceRow"
          :isCheckBox="question.answerTypes.multipleChoice.hasMultipleAnswers"
          :hasImage="question.answerTypes.multipleChoice.useImages"
          :data-qa="`user-choicerow-radio-${userChoiceRow.id}`"
        ></user-choice-row>
      </b-form-radio-group>
    </b-form-group>
    <b-form-invalid-feedback
      :state="isAnswerValid"
      style="clear:both"
      data-qa="invalid-feedback"
    >
      Please Select a choice.
    </b-form-invalid-feedback>
    <b-button class="submit-btn mt-3" variant="primary" type="submit">
      Submit
    </b-button>
  </b-form>
</template>

<script>
import UserChoiceRow from "./UserChoiceRow"
export default {
  name: "user-multiple-choice-form",
  components: {
    UserChoiceRow,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    question: {
      type: Object,
      required: true,
    },
    answer: {
      type: [String, Number, Array],
      required: true,
    },
  },
  data() {
    return {
      isAnswerValid: true,
      userSelectedCheckbox: [],
      userSelectedRadio: null,
      multipleChoiceAnswer: "",
    }
  },
  computed: {
    radioValidAnswerState() {
      return Boolean(this.userSelectedRadio)
    },
  },
  watch: {
    question() {
      if (this.answer === "") {
        this.userSelectedCheckbox = this.getPreSelectedCheckBoxValue()
        this.userSelectedRadio = this.getPreSelectedRadioValue()
      } else {
        if (this.question.answerTypes.multipleChoice.hasMultipleAnswers) {
          this.userSelectedCheckbox = this.answer
        } else {
          this.userSelectedRadio = this.answer
        }
      }
    },
  },
  created() {
    if (this.answer === "") {
      this.userSelectedCheckbox = this.getPreSelectedCheckBoxValue()
      this.userSelectedRadio = this.getPreSelectedRadioValue()
    } else {
      if (this.question.answerTypes.multipleChoice.hasMultipleAnswers) {
        if (typeof this.answer !== "object") {
          this.userSelectedCheckbox = []
        } else {
          this.userSelectedCheckbox = this.answer
        }
      } else {
        if (typeof this.answer !== "number") {
          this.userSelectedRadio = null
        } else {
          this.userSelectedRadio = this.answer
        }
      }
    }
  },
  methods: {
    handleMultipleChoiceSubmit(event) {
      event.preventDefault()
      if (this.question.answerTypes.multipleChoice.hasMultipleAnswers) {
        this.isAnswerValid = this.checkBoxValidAnswerState()
        this.multipleChoiceAnswer = this.userSelectedCheckbox
      } else {
        this.isAnswerValid = this.radioValidAnswerState
        this.multipleChoiceAnswer = this.userSelectedRadio
      }
      if (this.isAnswerValid) {
        this.$emit("submit", this.multipleChoiceAnswer)
      }
    },
    getPreSelectedCheckBoxValue() {
      if (this.question.answerTypes.multipleChoice.hasMultipleAnswers) {
        return this.question.answerTypes.multipleChoice.preSelectedCheckBoxOptions
      }
    },
    getPreSelectedRadioValue() {
      if (!this.question.answerTypes.multipleChoice.hasMultipleAnswers) {
        return this.question.answerTypes.multipleChoice.preSelectedRadioOptions[0]
      }
    },
    checkBoxValidAnswerState() {
      if (this.userSelectedCheckbox) {
        return this.userSelectedCheckbox.length > 0
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
}
.submit-btn {
  float: left;
}
</style>
