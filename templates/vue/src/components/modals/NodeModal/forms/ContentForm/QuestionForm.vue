<template>
  <div>
    <div class="question">
      <b-card bg-variant="secondary" text-variant="light" class="mb-3">
        <b-card
          sub-title="Show Answer to a Previous Activity First"
          bg-variant="light"
          text-variant="dark"
          class="mb-3"
        >
          <b-form-group>
            <b-form-checkbox v-model="question.isFollowUp" switch>
              {{ question.isFollowUp ? "Yes" : "No" }}
            </b-form-checkbox>
          </b-form-group>
          <b-form-group v-if="question.isFollowUp" label="Show this text first:">
            <b-form-input v-model="question.followUpText"></b-form-input>
          </b-form-group>
          <b-form-group
            v-if="question.isFollowUp"
            label="Then show user answer to the following activity:"
          >
            <combobox
              v-model="question.previousEntry"
              class="mb-0"
              :options="questionOptions"
              item-text="text"
              item-value="id"
              empty-message="There are no activities yet."
            >
              <template v-slot="slotProps">
                <p>
                  {{ slotProps.option.text }}
                </p>
              </template>
            </combobox>
          </b-form-group>
        </b-card>
        <b-card
          sub-title="Question Details"
          bg-variant="light"
          text-variant="dark"
          class="mb-3"
        >
          <b-form-group label="Question text">
            <b-form-input v-model="question.text" data-qa="question-text" />
          </b-form-group>

          <b-card-sub-title class="mt-2 mb-2">Answer Options</b-card-sub-title>
          <b-form-group label="Answer Types">
            <b-form-checkbox
              v-model="hasTextOption"
              data-qa="question-answer-text"
              switch
              @input="setId($event, 'textId')"
            >
              Text
            </b-form-checkbox>
            <b-form-checkbox
              v-model="node.typeData.options.audio"
              data-qa="question-answer-audio"
              switch
              @input="setId($event, 'audioId')"
            >
              Audio Recorder
            </b-form-checkbox>
             <b-form-checkbox
              v-model="hasMultipleChoiceOption"
              data-qa="question-answer-multiple-choice"
              switch
              @input="setId($event, 'multipleChoiceId')"
            >
              Multiple Choice
            </b-form-checkbox>
          </b-form-group>

          <b-form-group v-if="node.typeData.options.text" label="Text">
            <b-form-radio
              v-model="hasTextMultiLineOption"
              data-qa="question-answer-text-multi"
              name="multi-line"
              :value="true"
            >
              Multi-line
            </b-form-radio>
            <b-form-radio
              v-model="hasTextMultiLineOption"
              data-qa="question-answer-text-single"
              name="single-line"
              :value="false"
            >
              Single Line
            </b-form-radio>
          </b-form-group>

          <b-form-group v-if="hasTextOption && !hasTextMultiLineOption">
            <label for="placeholder">Placeholder (optional):</label>
            <b-form-input
              id="placeholder"
              v-model="node.typeData.options.text.placeholder"
              data-qa="question-answer-text-single-placeholder"
            ></b-form-input>
          </b-form-group>

           <b-form-group v-if="node.typeData.options.multipleChoice" label="Multiple Choice">
            <b-form-radio
              v-model="hasMultipleChoiceMultiAnswerOption"
              data-qa="question-answer-multipleChoice-multi"
              name="multiple-answer"
              :value="true"
            >
              Select Multiple Answer(Checkbox)
            </b-form-radio>
            <b-form-radio
              v-model="hasMultipleChoiceMultiAnswerOption"
              data-qa="question-answer-multipleChoice-single"
              name="one-answer"
              :value="false"
            >
              Select One Answer(Radio Button)
            </b-form-radio>
          </b-form-group>
          <b-form-group v-if="hasMultipleChoiceOption" label="">
            <multiple-choice-form :node="node" 
            :multipleChoiceSelected="hasMultipleChoiceOption"
            :multipleAnswerSelected="hasMultipleChoiceMultiAnswerOption"/>
          </b-form-group>
        </b-card>
        <b-card
          sub-title="Confirmation Page Customization"
          bg-variant="light"
          text-variant="dark"
        >
          <b-form-group label="Title">
            <b-form-input
              v-model="question.confirmationTitle"
              data-qa="question-confirmation-title"
              placeholder="Thanks!"
            />
          </b-form-group>
          <rich-text-form
            v-model="question.confirmationMessage"
            data-qa="question-confirmation-message"
            placeholder="Your response has been recorded."
          />
        </b-card>
      </b-card>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex"
import Combobox from "@/components/modals/common/Combobox"
import RichTextForm from "./RichTextForm"
import Helpers from "@/utils/Helpers"
import MultipleChoiceForm from './MultipleChoiceForm.vue'

const defaultQuestion = {
  text: "",
  answers: {
    textId: "",
    audioId: "",
    multipleChoiceId: "",
  },
}

export default {
  components: {
    Combobox,
    RichTextForm,
    MultipleChoiceForm,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      hasTextOption: Boolean(this.node.typeData.options?.text),
      hasTextMultiLineOption: Boolean(this.node.typeData.options?.text?.multi),
      hasMultipleChoiceOption: Boolean(this.node.typeData.options?.multipleChoice),
      hasMultipleChoiceMultiAnswerOption: Boolean(this.node.typeData.options?.multipleChoice?.multiAnswer),
    }
  },
  computed: {
    ...mapState(["nodes"]),
    question() {
      return this.node.quiz[0]
    },
    questionOptions() {
      let questions = Object.values(this.nodes)
        .filter(node => Boolean(node.quiz))
        .flatMap(node => node.quiz)
      questions = questions.filter(qn => qn.id !== this.question.id)
      return questions
    },
  },
  watch: {
    hasTextOption(textSelected) {
      if (textSelected) {
        this.question.answers.textId = Helpers.createUUID()
        this.node.typeData.options.text = {}
        this.hasTextMultiLineOption = true
      } else {
        this.question.answers.textId = ""
        this.hasTextMultiLineOption = false
        delete this.node.typeData.options.text
      }
    },
    hasTextMultiLineOption(multiLineSelected) {
      if (this.node.typeData.options.text) {
        this.node.typeData.options.text.multi = multiLineSelected
      }
    }, 
    hasMultipleChoiceOption(multipleChoiceSelected) {
      if (multipleChoiceSelected) {
        this.question.answers.multipleChoiceId = Helpers.createUUID()
        this.node.typeData.options.multipleChoice = {}
        this.hasMultipleChoiceMultiAnswerOption = true
      } else {
        this.question.answers.multipleChoiceId = ""
        this.hasMultipleChoiceMultiAnswerOption = false
        delete this.node.typeData.options.multipleChoice
      }
    }, 
    hasMultipleChoiceMultiAnswerOption(multiAnswerSelected) {
      if (this.node.typeData.options.multipleChoice) {
        this.node.typeData.options.multipleChoice.multiAnswer = multiAnswerSelected
      }
    },
  },
  created() {
    if (this.node.quiz.length == 0) {
      this.node.quiz = [
        {
          id: Helpers.createUUID(),
          isFollowUp: false,
          previousEntry: null,
          followUpText: "Previously, you said:",
          text: "",
          answers: { ...defaultQuestion.answers },
          completed: false,
        },
      ]
      this.node.typeData = {
        options: {},
        ...this.node.typeData,
      }
    }
  },
  methods: {
    setId(event, type) {
      this.question.answers[type] = event ? "1" : ""
    },
  },
}
</script>

<style scoped>
.question {
  margin-bottom: 1em;
}
</style>
