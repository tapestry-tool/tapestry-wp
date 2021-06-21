<template>
  <div>
    <b-form-group data-qa="activity-combobox" label="Select an activity:">
      <combobox
        v-model="activityNodeId"
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
      activityNodeId: "",
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
        .filter(node => node.id == this.activityNodeId)
        .flatMap(node => node.typeData.activity.questions)

      return questions
    },
  },
  watch: {
    activityNodeId(activityID) {
      if(activityID) {
        const questions = Object.values(this.currentActivityNodes)
          .filter(node => node.id == activityID)
          .flatMap(node => node.quiz)
        this.currentQuestions = questions
      }
    },
    currentQuestion(id) {
      if(id) {
        let selectedQuestion = []
        selectedQuestion = this.getCurrentQuestions.filter(
          question => question.id == id
        )
        this.currentQuestion = selectedQuestion[0].id
      }
    },
    followUpText(text) {
      this.followUpText = text
    },
  },
  mounted() {
    const prevAnswers = this.node.answers
    if (prevAnswers) {
      this.activityNodeId = prevAnswers.activityID
      this.currentQuestion = prevAnswers.questionID
      this.followUpText = prevAnswers.followUpText
    }
  },
  updated() {
    const answerObject = {
      activityID: this.activityNodeId,
      questionID: this.currentQuestion,
      followUpText: this.followUpText,
    }
    this.node.answers = answerObject
  },
}
</script>

<style scoped></style>
