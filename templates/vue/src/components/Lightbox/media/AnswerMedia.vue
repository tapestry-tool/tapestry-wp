<template>
  <div class="answers">
    <h3>{{ node.title }}</h3>
    <div
      v-if="answer !== null"
      class="answer-container mx-auto mb-3"
      data-qa="answer-display"
    >
      <h4>{{ answer.precedingText || question.text }}</h4>
      <b-tabs vertical no-nav-style nav-class="nav-tablist">
        <b-tab v-for="questionAnswer in answers" :key="questionAnswer.type">
          <template #title>
            <div class="icon">
              <tapestry-icon :icon="questionAnswer[0]" />
            </div>
          </template>
          <completed-activity-media
            v-if="questionAnswer[0] === 'audio'"
            :type="questionAnswer[0]"
            :answerData="getFullUrl(questionAnswer[1].url)"
          ></completed-activity-media>
          <completed-activity-media
            v-else
            :type="questionAnswer[0]"
            :answerData="questionAnswer[1]"
            :question="question"
          ></completed-activity-media>
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
import { mapGetters, mapState } from "vuex"
import CompletedActivityMedia from "./common/CompletedActivityMedia"
import TapestryIcon from "@/components/common/TapestryIcon"
import { data as wpData } from "@/services/wp"

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
  },
  computed: {
    ...mapState(["userAnswers"]),
    ...mapGetters(["getQuestion", "getAnswers"]),
    answer() {
      return this.node.typeData
    },
    question() {
      return this.getQuestion(this.answer.questionId)
    },
    answers() {
      const answers = this.getAnswers(this.answer.activityId, this.answer.questionId)
      return answers ? Object.entries(answers) : null
    },
    hasAnswer() {
      return this.answers.length ? true : false
    },
  },
  mounted() {
    this.$emit("complete")
    this.$emit("load")
  },
  methods: {
    getFullUrl(url) {
      return wpData.uploadDirArray.baseurl + "/" + url
    },
  },
}
</script>
<style lang="scss">
.nav-tablist a {
  color: #777;
  &.active {
    color: #fff;
  }
}
</style>
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
  color: #fff;
  margin-top: 15px;
}
.answer-container {
  width: 75%;
  margin-top: 20px;
}
</style>
