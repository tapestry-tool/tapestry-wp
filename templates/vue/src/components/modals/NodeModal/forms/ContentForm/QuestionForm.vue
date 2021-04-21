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
              :options="getPreviousOptions(node.quiz)"
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
            <b-form-checkbox v-model="hasTextOption" switch>
              Text
            </b-form-checkbox>
            <b-form-checkbox v-model="node.typeData.options.audio" switch>
              Audio Recorder
            </b-form-checkbox>
          </b-form-group>

          <b-form-group v-if="node.typeData.options.text" label="Text">
            <b-form-radio
              v-model="hasTextMultiLineOption"
              name="multi-line"
              :value="true"
            >
              Multi-line
            </b-form-radio>
            <b-form-radio
              v-model="hasTextMultiLineOption"
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
            ></b-form-input>
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
              data-testid="question-confirmation-title"
              placeholder="Thanks!"
            />
          </b-form-group>
          <rich-text-form
            v-model="question.confirmationMessage"
            data-testid="question-confirmation-message"
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

const defaultQuestion = {
  text: "",
  answers: {
    textId: "",
    audioId: "",
  },
}

export default {
  components: {
    Combobox,
    RichTextForm,
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
      questions: this.node.quiz,
    }
  },
  computed: {
    ...mapState(["nodes"]),
    question() {
      return this.node.quiz[0]
    },
    activities() {
      const questions = Object.values(this.nodes)
        .filter(node => Boolean(node.quiz))
        .flatMap(node => node.quiz)
      this.questions.forEach(q => {
        if (!questions.find(qn => qn.id === q.id)) {
          questions.push(q)
        }
      })
      return questions
    },
  },
  watch: {
    hasTextOption(textSelected) {
      if (textSelected) {
        this.node.typeData.options.text = {}
        this.hasTextMultiLineOption = true
      } else {
        delete this.node.typeData.options.text
      }
    },
    hasTextMultiLineOption(multiLineSelected) {
      if (this.node.typeData.options.text) {
        this.node.typeData.options.text.multi = multiLineSelected
      }
    },
  },
  created() {
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
  },
  methods: {
    getPreviousOptions(currentQuestion) {
      return this.activities.filter(qn => qn !== currentQuestion)
    },
  },
}
</script>

<style scoped>
.question {
  margin-bottom: 1em;
}
</style>
