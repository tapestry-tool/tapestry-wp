<template>
  <div class="answers">
    <h1>{{ node.title }}</h1>
    <div
      v-if="answer !== null"
      class="answer-container mx-auto mb-3"
      data-qa="answer-display"
    >
      <h3>{{ question.text }}</h3>
      <h4 v-show="followUpText && hasAnswer" class="mb-4">
        {{ answer.followUpText }}
      </h4>
      <h4 v-show="!followUpText && hasAnswer" class="mb-4">
        {{ question.followUpText }}
      </h4>
      <b-tabs>
        <b-tab v-for="questionAnswer in getAnswers" :key="questionAnswer.type">
          <template #title>
            <div class="icon">
              <tapestry-icon :icon="questionAnswer.type" />
              | {{ questionAnswer.type }}
            </div>
          </template>
          <tapestry-activity
            :type="questionAnswer.type"
            :entry="questionAnswer.entry"
          ></tapestry-activity>
        </b-tab>
      </b-tabs>
      <div v-show="getAnswers.length == 0">
        You have not completed this question yet.
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
import TapestryIcon from "@/components/common/TapestryIcon"
export default {
  name: "answer-media",
  components: {
    TapestryActivity,
    TapestryIcon,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getEntry", "getQuestion"]),
    answer() {
      return this.node.answer
    },
    question() {
      return this.getQuestion(this.answer.questionId)
    },
    followUpText() {
      return this.answer.followUpText !== ""
    },
    getAnswers() {
      try {
        const answeredTypes = Object.entries(this.question.answers)
          .filter(entry => entry[1] && entry[1].length > 0)
          .map(i => i[0])
        return answeredTypes
          .map(type => this.getEntry(this.question.id, type, this.node.mediaType))
          .filter(Boolean)
      } catch (error) {
        return []
      }
    },
    hasAnswer() {
      return this.getAnswers.length > 0
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
