<template>
  <div>
    <b-form-group data-qa="activity-combobox" label="Activity">
      <combobox
        v-model="activityNodeId"
        :options="activityNodes"
        data-qa="choose-activity-node"
        item-text="title"
        item-value="id"
        empty-message="Please select an Activity first"
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
      label="Question"
    >
      <combobox
        v-model="currentQuestion"
        :options="currentQuestions"
        data-qa="choose-question"
        item-text="text"
        item-value="id"
        empty-message="Please select an activity first."
      >
        <template v-slot="slotProps">
          <p>
            {{ slotProps.option.text }}
          </p>
        </template>
      </combobox>
    </b-form-group>
    <b-form-group
      label="Show this text first"
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
    activityNodes() {
      const activityNodes = Object.values(this.nodes).filter(
        node => node.mediaType == "activity"
      )
      return activityNodes
    },
    currentQuestions() {
      const questions = Object.values(this.activityNodes)
        .filter(node => node.id == this.activityNodeId)
        .flatMap(node => node.typeData.activity.questions)

      return questions
    },
  },
  watch: {
    activityNodeId(activityID) {
      if (activityID) {
        const questions = Object.values(this.activityNodes)
          .filter(node => node.id == activityID)
          .flatMap(node => node.quiz)
        this.currentQuestions = questions
      }
    },
    currentQuestion(id) {
      if (id) {
        let selectedQuestion = []
        selectedQuestion = this.currentQuestions.filter(
          question => question.id == id
        )
        this.currentQuestion = selectedQuestion[0].id
      }
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
