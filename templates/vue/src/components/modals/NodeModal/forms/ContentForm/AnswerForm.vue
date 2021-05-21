<template>
  <div>
    <!-- <p>{{ activities }}</p> -->
    <p>{{ currentQuestionID }}</p>
    <b-form-group label="Show this text first:">
      <b-form-input v-model="followUpText"></b-form-input>
    </b-form-group>
    <!-- <b-form-group label="Select an activity:">
      <combobox
        v-model="currentActivityTitle"
        :options="currentActivityNodes"
        item-text="text"
        item-value="title"
        empty-message="There are no activities yet."
      >
        <template v-slot="slotProps">
          <p>
            {{ slotProps.option.title }}
          </p>
        </template>
      </combobox>
    </b-form-group> -->
    <!-- <b-form-group label="Select a question from that activity:">
      <combobox
        v-model="currentQuestion"
        :options="selectedNodeQuestions"
        item-text="text"
        item-value="id"
        empty-message="There are no activities yet."
      >
        <template v-slot="slotProps">
          <p>
            {{ slotProps.option.title }}
          </p>
        </template>
      </combobox>
    </b-form-group> -->
    <b-form-group label="Then show user answer to the following question:">
      <combobox
        v-model="currentQuestionID"
        :options="currentQuestions"
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
      currentQuestionID: "",
      currentActivityTitle: "",
      currentQuestions2: [],
      selectedQuestion: {},
      answer: {},
      // questions: [],
      followUpText: "",
    }
  },
  computed: {
    ...mapState(["nodes"]),
    // returns all activity nodes in the tapestry
    currentActivityNodes() {
      const activityNodes = Object.values(this.nodes).filter(
        node => node.mediaType == "activity"
      )
      return activityNodes
    },
    // returns all questions in the tapestry
    currentQuestions() {
      const questions = Object.values(this.nodes)
        .filter(node => Boolean(node.quiz))
        .flatMap(node => node.quiz)
      return questions
    },
    // get the selectedQuestion's answers
    currentAnswer() {
      return this.selectedQuestion.answers
    },
    // get the selectedQuestion's question text
    questionText() {
      return this.selectedQuestion.text
    },
  },
  watch: {
    // when the user selects a different question, set  this.selectedQuestion
    currentQuestionID(id) {
      this.currentQuestions.forEach(question => {
        if (question.id == id) {
          this.selectedQuestion = question
        }
      })
    },
    // set the Answer node's quiz to have the selected question
    selectedQuestion(question) {
      let questionArray = []
      questionArray.push(question)
      this.node.quiz = questionArray
    },
    // currentActivityTitle(title) {
    //   this.currentActivityNodes.forEach(node => {
    //     if (node.title == title) {
    //       console.log("This is the title  :" + title)
    //       console.log("This is the node title  :" + node.title)
    //       console.log("This is the node quiz  :" + Array.isArray(node.quiz))
    //       this.currentQuestions2 = node.quiz
    //     }
    //   })
    //   this.currentQuestions2 = null
    // },
  },
  // activities() {
  //   let activityNodes = Object.values(this.nodes).filter(
  //     node => node.mediaType == "activity"
  //   )
  //   console.log("These are the activity nodes: " + activityNodes)
  //   return activityNodes
  // },
  // methods: {
  //   selectedActivityQuestions(activityNode) {
  //     return activityNode.quiz
  //   },
  //   // activityNodeTitles() {
  //   //   let activityNodeTitles = []
  //   //   this.activities.forEach(activitynode => {
  //   //     activityNodeTitles.push(activitynode.title)
  //   //   })
  //   //   console.log("These are the activity nodes names: " + activityNodeTitles)
  //   //   return activityNodeTitles
  //   // },
  //   activityQuestions(node) {
  //     // change to get quiz of a single selected node
  //     const questions = Object.values(node)
  //       .filter(node => Boolean(node.quiz))
  //       .flatMap(node => node.quiz)
  //     this.questions.forEach(q => {
  //       if (!questions.find(qn => qn.id === q.id)) {
  //         questions.push(q)
  //       }
  //     })
  //     return questions
  //   },
  // },
}
</script>

<style scoped></style>
