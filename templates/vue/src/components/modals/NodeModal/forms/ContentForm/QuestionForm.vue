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
          <b-form-group class="mt-3">
            <b-form-checkbox
              v-model="hasTextOption"
              data-qa="question-answer-text"
              switch
              @input="setId($event, 'textId')"
            >
              Text entry
            </b-form-checkbox>
            <div v-if="node.typeData.options.text" class="mt-2 pl-4 ml-2">
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
              <div v-if="hasTextOption && !hasTextMultiLineOption" class="mt-2 pl-4">
                <label for="placeholder">Placeholder (optional):</label>
                <b-form-input
                  id="placeholder"
                  v-model="node.typeData.options.text.placeholder"
                  data-qa="question-answer-text-single-placeholder"
                ></b-form-input>
              </div>
            </div>
          </b-form-group>
          <b-form-group>
            <b-form-checkbox
              v-model="node.typeData.options.audio"
              data-qa="question-answer-audio"
              switch
              @input="setId($event, 'audioId')"
            >
              Audio recorder
            </b-form-checkbox>
          </b-form-group>
          <b-form-group>
            <b-form-checkbox
              v-model="hasListOption"
              data-qa="question-answer-list"
              switch
              @input="setId($event, 'listId')"
            >
              List
            </b-form-checkbox>
            <div v-if="hasListOption" class="mt-2 pl-4">
              <label for="placeholder">List Placeholder (optional):</label>
              <b-form-input
                id="placeholder"
                v-model="node.typeData.options.list.placeholder"
                data-qa="question-answer-list-placeholder"
              ></b-form-input>
            </div>
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
const defaultQuestion = {
  text: "",
  answers: {
    textId: "",
    audioId: "",
    listId: "",
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
      hasListOption: Boolean(this.node.typeData.options?.list),
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
    hasListOption(listSelected) {
      if (listSelected) {
        this.question.answers.listId = Helpers.createUUID()
        this.node.typeData.options.list = {
          list: true,
          placeholder: "",
        }
      } else {
        this.question.answers.listId = ""
        delete this.node.typeData.options.list
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
