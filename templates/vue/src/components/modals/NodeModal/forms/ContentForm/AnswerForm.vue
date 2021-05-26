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
    <b-form-group label="Select a question from that activity:">
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
      v-show="currentQuestion"
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
      currentActivityID: this.initializeActivityID(),
      currentQuestion: this.initializeCurrentQuestion(),
      followUpText: this.initializeFollowUpText(),
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
      this.currentQuestion = ""
    },
    currentQuestion(id) {
      let selectedQuestion = []
      selectedQuestion = this.getCurrentQuestions.filter(
        question => question.id == id
      )
      const answerObject = {
        activityID: this.currentActivityID,
        question: selectedQuestion[0],
      }
      this.node.answers = [answerObject]
    },
    followUpText(text) {
      this.node.answers[0].question.followUpText = text
    },
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
        return this.node.answers[0].question.id
      }
      return ""
    },
    initializeFollowUpText() {
      if (this.node.answers.length > 0) {
        return this.node.answers[0].question.followUpText
      }
      return ""
    },
  },
}
</script>

<style scoped></style>
