<template>
  <div>
    <b-form-group data-qa="activity-combobox" label="Select an activity:">
      <combobox
        v-model="currentActivityID"
        :options="currentActivityNodes"
        data-qa="choose-activity-node"
        item-text="title"
        item-value="id"
        empty-message="There are no activities yet."
      >
        <template v-slot="slotProps">
          <p>
            {{ slotProps.option.title }}
          </p>
        </template>
      </combobox>
    </b-form-group>
    <b-form-group
      data-qa="question-select"
      label="Select a question from that activity:"
    >
      <combobox
        v-model="currentQuestion"
        :options="getCurrentQuestions"
        data-qa="choose-question"
        item-text="text"
        item-value="id"
        empty-message="There is no activity selected yet."
      >
        <template v-slot="slotProps">
          <p>
            {{ slotProps.option.text }}
          </p>
        </template>
      </combobox>
    </b-form-group>
    <b-form-group
      label="Show this text first: "
      description="If empty, will default to the follow-up text of the activity form."
    >
      <b-form-input v-model="followUpText" data-qa="follow-up-text"></b-form-input>
    </b-form-group>
  </div>
</template>

<script>
import { mapState } from "vuex"
import Combobox from "@/components/modals/common/Combobox"

export default {
  components: {
    Combobox,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      currentActivityID: "",
      currentQuestion: "",
      followUpText: "",
    }
  },
  computed: {
    ...mapState(["nodes"]),
    currentActivityNodes() {
      const activityNodes = Object.values(this.nodes).filter(
        node => node.mediaType == "activity"
      )
      return activityNodes
    },
    getCurrentQuestions() {
      const questions = Object.values(this.currentActivityNodes)
        .filter(node => node.id == this.currentActivityID)
        .flatMap(node => node.quiz)
      return questions
    },
  },
  watch: {
    currentActivityID(activityID) {
      const questions = Object.values(this.currentActivityNodes)
        .filter(node => node.id == activityID)
        .flatMap(node => node.quiz)
      this.currentQuestions = questions
    },
    currentQuestion(id) {
      let selectedQuestion = []
      selectedQuestion = this.getCurrentQuestions.filter(
        question => question.id == id
      )
      this.currentQuestion = selectedQuestion[0].id
    },
    followUpText(text) {
      this.followUpText = text
    },
  },
  mounted() {
    this.currentActivityID = this.initializeActivityID()
    this.currentQuestion = this.initializeCurrentQuestion()
    this.followUpText = this.initializeFollowUpText()
  },
  updated() {
    const answerObject = {
      activityID: this.currentActivityID,
      questionID: this.currentQuestion,
      followUpText: this.followUpText,
    }
    this.node.answers = [answerObject]
  },
  methods: {
    initializeActivityID() {
      if (this.node.answers.length > 0) {
        return this.node.answers[0].activityID
      }
      return ""
    },
    initializeCurrentQuestion() {
      if (this.node.answers.length > 0) {
        return this.node.answers[0].questionID
      }
      return ""
    },
    initializeFollowUpText() {
      if (this.node.answers.length > 0) {
        return this.node.answers[0].followUpText
      }
      return ""
    },
  },
}
</script>

<style scoped></style>
