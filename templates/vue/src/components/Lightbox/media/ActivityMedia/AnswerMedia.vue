<template>
  <div class="answer-container mx-auto mb-3" data-qa="answer-display">
    <b-tabs
      v-if="answers.length > 1"
      vertical
      no-nav-style
      nav-class="nav-tablist mt-4 pt-4"
    >
      <b-tab v-for="questionAnswer in answers" :key="questionAnswer[0]">
        <template #title>
          <div class="icon">
            <tapestry-icon :icon="getIcon(questionAnswer[0])" />
          </div>
        </template>
        <h1 class="question-title mb-3">
          {{ answersTypeData.precedingText || question.text }}
        </h1>
        <completed-activity-media
          :type="questionAnswer[0]"
          :answerData="questionAnswer[1]"
          :question="question"
        ></completed-activity-media>
      </b-tab>
    </b-tabs>
    <div v-else-if="hasAnswer">
      <h1 class="question-title mb-3">
        {{ answersTypeData.precedingText || question.text }}
      </h1>
      <completed-activity-media
        :type="answers[0][0]"
        :answerData="answers[0][1]"
        :question="question"
      ></completed-activity-media>
    </div>
    <div v-else class="p-2 my-4">
      <em>This question has not been answered yet.</em>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex"
import CompletedActivityMedia from "@/components/Lightbox/media/common/CompletedActivityMedia"
import TapestryIcon from "@/components/common/TapestryIcon"

export default {
  name: "answer-media",
  components: {
    CompletedActivityMedia,
    TapestryIcon,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    typeData: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState(["userAnswers"]),
    ...mapGetters(["getQuestion", "getAnswers"]),
    answersTypeData() {
      return Object.entries(this.typeData).length
        ? this.typeData
        : this.node.typeData
    },
    question() {
      return this.getQuestion(this.answersTypeData.questionId)
    },
    answers() {
      const answers = this.getAnswers(
        this.answersTypeData.activityId,
        this.answersTypeData.questionId
      )
      return answers ? Object.entries(answers) : null
    },
    hasAnswer() {
      return this.answers?.length ? true : false
    },
  },
  mounted() {
    this.$emit("complete")
    this.$emit("load")
  },
  methods: {
    getIcon(answerType) {
      if (answerType == "multipleChoice") {
        return "tasks"
      }
      return answerType
    },
  },
}
</script>
<style lang="scss">
.nav-tablist a {
  color: var(--text-color-primary);
  &.active {
    color: var(--text-color-primary);
  }
}
.popup .question-title {
  font-size: 18px;
  margin-bottom: 18px;
}
</style>
<style lang="scss" scoped>
.answer-container {
  color: var(--text-color-primary);
  width: 100%;
  margin-top: 16px;

  @media screen and (min-width: 1000px) {
    width: 75%;
  }

  .question-title {
    position: relative;
    font-size: 28px;
    font-weight: 600 !important;
    margin-top: 4px;

    &:before {
      display: none;
    }
  }
}
</style>
