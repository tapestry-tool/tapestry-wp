<template>
  <b-form class="container" @submit="handleMultipleChoiceSubmit">
    <p>multipleAnswerSelected is {{ multipleAnswerSelected }}</p>
    <p>user selected option is {{ userSelectedOption }}</p>
    <p>multipleChoiceAnswer is {{ multipleChoiceAnswer }}</p>
    <b-form-group>
      <!-- // use component is here because b-form checkbox group vs b-form radio group -->
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

    <!-- <b-form-group v-else>
      // use component with is prop to get rid of v if-v-else here
      <b-form-radio-group v-model="userSelectedRadio">
        <multiple-choice-question-item
          v-for="userChoiceRow in question.answerTypes.multipleChoice.radioArray"
          :key="userChoiceRow.id"
          :item="userChoiceRow"
          :isCheckBox="question.answerTypes.multipleChoice.hasMultipleAnswers"
          :hasImage="question.answerTypes.multipleChoice.useImages"
          :data-qa="`multiple-choice-question-radio-${userChoiceRow.id}`"
        ></multiple-choice-question-item>
      </b-form-radio-group>
    </b-form-group> -->

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
      userSelectedCheckbox: [],
      userSelectedRadio: null,
      multipleChoiceAnswer: [],
    }
  },
  computed: {
    radioValidAnswerState() {
      return Boolean(this.userSelectedRadio)
    },
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
        this.userSelectedCheckbox = this.preSelectedValue()
        this.userSelectedRadio = this.getPreSelectedRadioValue()
      } else {
        if (this.multipleAnswerSelected) {
          this.userSelectedOption = this.answer
          this.userSelectedCheckbox = this.answer
        } else {
          this.userSelectedOption = this.answer[0]
          this.userSelectedRadio = this.answer
        }
      }
    },
  },
  created() {
    console.log("answer is", this.answer)
    console.log("answer type is", typeof this.answer)
    if (this.answer === "") {
      this.userSelectedOption = this.preSelectedValue()
      this.userSelectedCheckbox = this.preSelectedValue()
      this.userSelectedRadio = this.getPreSelectedRadioValue()
    } else {
      if (this.multipleAnswerSelected) {
        console.log("got here checkbox")
        this.userSelectedCheckbox = this.answer
        this.userSelectedOption = this.answer
      } else {
        console.log("got here radio")
        this.userSelectedRadio = this.answer
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
</style>
