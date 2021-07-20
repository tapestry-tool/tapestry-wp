<template>
  <b-form class="container" @submit="handleMultipleChoiceSubmit">
    <b-form-group>
      <component
        :is="allowSelectMultiple ? 'b-form-checkbox-group' : 'b-form-radio-group'"
        v-model="userSelection"
      >
        <multiple-choice-question-item
          v-for="(choice, index) in question.answerTypes.multipleChoice.choices"
          :key="choice.id"
          :item="choice"
          :index="index"
          :isCheckBox="allowSelectMultiple"
          :hasImage="question.answerTypes.multipleChoice.useImages"
          :data-qa="`multiple-choice-question-${index}`"
        ></multiple-choice-question-item>
      </component>
    </b-form-group>
    <b-form-invalid-feedback
      :state="!submitPressed || answerValid"
      class="clearfix"
      data-qa="invalid-feedback"
    >
      Please select {{ allowSelectMultiple ? "one or more choices" : "a choice" }}.
    </b-form-invalid-feedback>
    <b-form-group>
      <b-button-group class="button-row">
        <b-button
          v-if="question.optional"
          class="mt-3 mx-1"
          variant="outline-primary"
          @click="$emit('skipQuestion')"
        >
          Skip
        </b-button>
        <b-button class="mt-3 mx-1" variant="primary" type="submit">
          Submit
        </b-button>
      </b-button-group>
    </b-form-group>
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
      userSelection: this.allowSelectMultiple ? [] : null,
      submitPressed: false,
    }
  },
  computed: {
    allowSelectMultiple() {
      return this.question.answerTypes.multipleChoice.allowSelectMultiple
    },
    answerValid() {
      if (this.allowSelectMultiple) {
        return this.userSelection.length > 0
      } else {
        return this.userSelection !== null
      }
    },
    preSelectedValue() {
      if (this.allowSelectMultiple) {
        return this.question.answerTypes.multipleChoice.preSelectedOptions
      } else {
        return this.question.answerTypes.multipleChoice.preSelectedOptions[0]
      }
    },
  },
  watch: {
    question() {
      this.setUserSelection()
    },
  },
  created() {
    this.setUserSelection()
  },
  methods: {
    setUserSelection() {
      if (this.answer === "") {
        this.userSelection = this.preSelectedValue
      } else {
        this.userSelection = this.allowSelectMultiple ? this.answer : this.answer[0]
      }
    },
    handleMultipleChoiceSubmit(event) {
      event.preventDefault()
      this.submitPressed = true
      if (this.answerValid) {
        this.$emit(
          "submit",
          this.allowSelectMultiple ? this.userSelection : [this.userSelection]
        )
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

.button-row {
  float: right;
  margin-top: 30px;
  width: 30%;
}
</style>
