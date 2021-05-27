<template>
  <div class="answers">
    <h1>{{ node.title }}</h1>
    <div
      v-if="answers.length"
      class="answer-container mx-auto mb-3"
      data-qa="answer-display"
    >
      <h3>{{ question.text }}</h3>
      <h4 v-if="followUpText" class="mb-4">
        {{ answers[0].followUpText }}
      </h4>
      <h4 v-else class="mb-4">{{ question.followUpText }}</h4>
      <tapestry-activity
        v-for="answer in getAnswers"
        :key="answer.type"
        :type="answer.type"
        :entry="answer.entry"
      ></tapestry-activity>
      <div v-show="getAnswers.length == 0">
        You have not completed this question yet, or the answer is undefined.
      </div>
    </div>
    <div v-else>
      <p>Please fill in the answer form.</p>
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
    ...mapGetters(["getEntry", "getQuestion"]),
    answers() {
      return this.node.answers
    },
    question() {
      return this.getQuestion(this.answers[0].questionID)
    },
    followUpText() {
      if (this.answers[0].followUpText !== "") {
        return true
      }
      return false
    },
    getAnswers() {
      try {
        const answeredTypes = Object.entries(this.question.answers)
          .filter(entry => entry[1] && entry[1].length > 0)
          .map(i => i[0])
        return answeredTypes
          .map(type => this.getEntry(this.question.id, type))
          .filter(Boolean)
      } catch (error) {
        return []
      }
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
