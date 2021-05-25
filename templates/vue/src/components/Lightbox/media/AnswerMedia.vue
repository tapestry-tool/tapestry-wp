<template>
  <div class="answers">
    <h1>{{ node.title }}</h1>
    <div v-if="answers.length" class="answer-container mx-auto mb-3">
      <h3>{{ question.text }}</h3>
      <h3 class="mb-4">{{ question.followUpText }}</h3>
      <tapestry-activity
        v-for="answer in answers"
        :key="answer.type"
        :type="answer.type"
        :entry="answer.entry"
      ></tapestry-activity>
    </div>
    <div v-else>
      <p>You haven't done the previous activity yet.</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TapestryActivity from "./common/ActivityScreen/TapestryActivity"

export default {
  name: "answer-media",
  components: {
    TapestryActivity,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getEntry"]),
    quiz() {
      return this.node.quiz
    },
    question() {
      return this.node.quiz[0]
    },
    answers() {
      const answeredTypes = Object.entries(this.question.answers)
        .filter(entry => entry[1] && entry[1].length > 0)
        .map(i => i[0])
      // console.log(answeredTypes)
      return answeredTypes
        .map(type => this.getEntry(this.question.previousEntry, type))
        .filter(Boolean)
    },
  },
  mounted() {
    this.$emit("complete")
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
.answers {
  color: white;
}
.answer-container {
  width: 75%;
}
</style>
