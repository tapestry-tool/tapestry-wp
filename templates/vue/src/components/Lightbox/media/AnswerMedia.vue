<template>
  <div>
    <activity-screen
      :id="node.id"
      style="position: relative;"
      @submit="handleSubmit"
      @back="$emit('close')"
      @close="$emit('close')"
    />
    <h3 class="mb-4">{{ question.followUpText }}</h3>
    <tapestry-activity
      v-for="answer in answers"
      :key="answer.type"
      :type="answer.type"
      :entry="answer.entry"
    ></tapestry-activity>
    <div>
      <p>You haven't done the previous activity yet.</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import ActivityScreen from "./common/ActivityScreen"

export default {
  name: "answer-media",
  components: {
    ActivityScreen,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    questionIndex: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getNode", "getEntry", "getQuestion"]),
    quiz() {
      return this.node.quiz
    },
    activeQuestion() {
      return this.quiz[0]
    },
    lastQuestion() {
      if (this.question.previousEntry) {
        return this.getQuestion(this.question.previousEntry)
      }
      return null
    },
    answers() {
      if (this.question.previousEntry) {
        const answeredTypes = Object.entries(this.lastQuestion.answers)
          .filter(entry => entry[1] && entry[1].length > 0)
          .map(i => i[0])
        return answeredTypes
          .map(type => this.getEntry(this.question.previousEntry, type))
          .filter(Boolean)
      }
      return []
    },
    options() {
      return Object.entries(this.question.answers).filter(
        opt => opt[1] && opt[1].length > 0
      )
    },
  },
  mounted() {
    this.$emit("load")
  },
}
</script>

<style lang="scss" scoped>
.media-title {
  text-align: left;
  font-size: 1.75rem;
  font-weight: 500;
  margin-bottom: 0.9em;

  :before {
    display: none;
  }
}
</style>
