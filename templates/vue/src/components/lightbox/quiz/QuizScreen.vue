<template>
  <div class="quiz-screen" :style="{ backgroundImage }">
    <button class="button-nav button-nav-menu" @click="back">
      <i class="fas fa-arrow-left"></i>
    </button>
    <question
      v-if="!submittingForm"
      :question="activeQuestion"
      :current-step="currentQuestionText"
      @form-opened="formOpened = true"
      @recorder-opened="recorderOpened = true"
      @form-submitted="handleFormSubmit"
      @h5p-recorder-saver-loaded="h5pRecorderSaverLoaded"
    ></question>
    <loading v-if="submittingForm" label="Submitting..." />
    <footer v-if="!formOpened && !recorderOpened" class="question-footer">
      <p class="question-step">{{ currentQuestionText }}</p>
      <button class="button-nav" :disabled="!hasPrev" @click="prev">
        <i class="fas fa-arrow-left"></i>
      </button>
      <button class="button-nav" :disabled="!hasNext" @click="next">
        <i class="fas fa-arrow-right"></i>
      </button>
    </footer>
  </div>
</template>

<script>
import { mapActions } from "vuex"
import Question from "./Question"
import Loading from "../../Loading"
import Helpers from "../../../utils/Helpers"
import BackgroundImg from "../../../assets/question-screen-bg.png"

export default {
  name: "quiz-screen",
  components: {
    Question,
    Loading,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      activeQuestionIndex: 0,
      formOpened: false,
      recorderOpened: false,
      submittingForm: false,
    }
  },
  computed: {
    quiz() {
      return this.node.quiz
    },
    activeQuestion() {
      return this.quiz[this.activeQuestionIndex]
    },
    backgroundImage() {
      return `url(${Helpers.getImagePath(BackgroundImg)})`
    },
    currentQuestionText() {
      return `${this.activeQuestionIndex + 1}/${this.quiz.length}`
    },
    hasNext() {
      return this.activeQuestionIndex !== this.quiz.length - 1
    },
    hasPrev() {
      return this.activeQuestionIndex !== 0
    },
  },
  methods: {
    ...mapActions(["completeQuestion"]),
    async handleFormSubmit({ answerType, formId, questionId }) {
      this.submittingForm = true
      await this.completeQuestion({ nodeId: this.node.id, answerType, formId, questionId })
      this.submittingForm = false
      this.formOpened = false
    },
    next() {
      this.activeQuestionIndex++
    },
    prev() {
      this.activeQuestionIndex--
    },
    back() {
      this.$emit("close")
    },
    h5pRecorderSaverLoaded(event) {
      this.$emit("h5p-recorder-saver-loaded", { loadedH5pId: event.loadedH5pId })
    },
  },
}
</script>

<style>
.quiz-screen {
  display: flex;
  background-size: cover;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  padding: 24px;
  padding-left: 40%;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  color: black;
  z-index: 10;
}
</style>

<style lang="scss" scoped>
.question-footer {
  margin-top: 1em;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.button-nav {
  border-radius: 50%;
  height: 56px;
  width: 56px;
  background: var(--tyde-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: white;
  margin-right: 12px;
  opacity: 1;
  transition: opacity 0.1s ease-out;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:last-child {
    margin-right: 0;
  }
}

.button-nav-menu {
  width: 80px;
  height: 80px;
  font-size: 64px;

  position: absolute;
  top: 24px;
  left: 24px;
}

.question-step {
  margin: 0;
  padding: 0;
  font-weight: bold;
  font-size: 40px;
  color: var(--tyde-blue);
  margin-right: 32px;
}
</style>
