<template>
  <div>
    <b-form-group label="Select an activity:">
      <combobox
        v-model="currentActivityID"
        :options="currentActivityNodes"
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
        :options="currentQuestions"
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
    <b-form-group v-show="currentQuestion" label="Show this text first: ">
      <b-form-input v-model="followUpText"></b-form-input>
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
      currentQuestions: [],
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
    // computedActivityID: {
    //   get() {
    //     if (this.node.quiz[0].length > 0) {
    //       for (const activity of this.currentActivityNodes) {
    //         for (const question of activity.quiz) {
    //           if (question.id == this.node.quiz[0].id) {
    //             return activity.id
    //           }
    //         }
    //       }
    //     }
    //     return this.currentActivityID
    //   },
    //   set(newID) {
    //     this.currentActivityID = newID
    //   },
    // },
    // computedQuestion: {
    //   get() {
    //     if (this.node.quiz[0].length > 0) {
    //       return this.node.quiz[0].id
    //     }
    //     return this.currentActivityID
    //   },
    //   set(newQuestion) {
    //     this.currentQuestion = newQuestion
    //   },
    // },
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
      selectedQuestion = this.currentQuestions.filter(question => question.id == id)
      this.node.quiz = selectedQuestion
    },
    followUpText(text) {
      this.node.quiz[0].followUpText = text
    },
  },
}
</script>

<style scoped></style>
