<template>
  <b-form class="container" @submit="handleMultipleChoiceSubmit">
    <b-form-group>
      <component :is="multipleChoiceGroup" v-model="userSelectedOption">
        <multiple-choice-question-item
          v-for="userChoiceRow in question.answerTypes.multipleChoice.choices"
          :key="userChoiceRow.id"
          :item="userChoiceRow"
          :isCheckBox="multipleAnswerSelected"
          :hasImage="question.answerTypes.multipleChoice.useImages"
          :data-qa="`multiple-choice-question-${userChoiceRow.id}`"
        ></multiple-choice-question-item>
      </component>
    </b-form-group>
    <b-form-invalid-feedback
      :state="isAnswerValid"
      class="clearfix"
      data-qa="invalid-feedback"
    >
      Please select a choice.
    </b-form-invalid-feedback>
    <b-button class="float-left mt-3" variant="primary" type="submit">
      Submit
    </b-button>
  </b-form>
</template>

<script>
import MultipleChoiceQuestionItem from "./MultipleChoiceQuestionItem"
export default {
  name: "multiple-choice-question",
  components: {
    MultipleChoiceQuestionItem,
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
      userSelectedOption: this.userSelectedOptionInitialValue,
      multipleChoiceAnswer: [],
    }
  },
  computed: {
    multipleAnswerSelected() {
      return this.question.answerTypes.multipleChoice.hasMultipleAnswers
    },
    userSelectedOptionInitialValue() {
      if (this.multipleAnswerSelected) {
        return []
      } else {
        return null
      }
    },
    multipleChoiceGroup() {
      if (this.multipleAnswerSelected) {
        return "b-form-checkbox-group"
      } else {
        return "b-form-radio-group"
      }
    },
    validUserSelectedOption() {
      if (this.multipleAnswerSelected) {
        return this.userSelectedOption.length > 0
      } else {
        return Boolean(this.userSelectedOption)
      }
    },
  },
  watch: {
    question() {
      if (this.answer === "") {
        this.userSelectedOption = this.preSelectedValue()
      } else {
        if (this.multipleAnswerSelected) {
          this.userSelectedOption = this.answer
        } else {
          this.userSelectedOption = this.answer[0]
        }
      }
    },
  },
  created() {
    if (this.answer === "") {
      this.userSelectedOption = this.preSelectedValue()
    } else {
      if (this.multipleAnswerSelected) {
        this.userSelectedOption = this.answer
      } else {
        this.userSelectedOption = this.answer[0]
      }
    }
  },
  methods: {
    handleMultipleChoiceSubmit(event) {
      event.preventDefault()
      this.isAnswerValid = this.validUserSelectedOption
      if (this.multipleAnswerSelected) {
        this.multipleChoiceAnswer = this.userSelectedOption
      } else {
        this.multipleChoiceAnswer.push(this.userSelectedOption)
      }
      if (this.isAnswerValid) {
        this.$emit("submit", this.multipleChoiceAnswer)
      }
    },
    preSelectedValue() {
      if (this.multipleAnswerSelected) {
        return this.question.answerTypes.multipleChoice.preSelectedOptions
      } else {
        return this.question.answerTypes.multipleChoice.preSelectedOptions[0]
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
</style>
