<template>
  <div class="answers">
    <h3>{{ node.title }}</h3>
    <div
      v-if="answer !== null"
      class="answer-container mx-auto mb-3"
      data-qa="answer-display"
    >
      <h2>{{ question.text }}</h2>
      <h4 v-show="followUpText && hasAnswer" class="mb-4">
        {{ answer.followUpText }}
      </h4>
      <h4 v-show="!followUpText && hasAnswer" class="mb-4">
        {{ question.followUpText }}
      </h4>
      <b-tabs>
        <b-tab
          v-for="questionAnswer in getAnswers"
          :key="questionAnswer.type"
          :active="questionAnswer.type === lastAnswerType"
        >
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
      <div v-show="!hasAnswer" class="media-wrapper">
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
    lastAnswerType() {
      return this.question.lastAnswerType
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
.media-wrapper {
  position: relative;
  align-items: center;
  background: #262626;
  border-radius: 8px;
  display: flex;
  margin-bottom: 8px;
  margin-top: 8px;
  padding: 8px 16px 8px 38px;
  justify-content: center;
}

.answers {
  color: white;
  margin-top: 15px;
}
.answer-container {
  width: 75%;
  margin-top: 20px;
}
</style>
