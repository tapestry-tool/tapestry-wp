<template>
  <div class="quiz-screen" :style="{ backgroundImage }">
    <completion-screen v-if="showCompletionScreen" :question="activeQuestion">
      <button v-if="hasNext" class="button-completion" @click="next">
        <i class="fas fa-arrow-circle-right fa-4x"></i>
        <p>Next question</p>
      </button>
      <button v-else class="button-completion" @click="$emit('close')">
        <i class="far fa-times-circle fa-4x"></i>
        <p>Done</p>
      </button>
    </completion-screen>
    <question
      v-else
      :question="activeQuestion"
      :current-step="currentQuestionText"
      :node="node"
      @submit="handleSubmit"
      @back="$emit('back')"
    ></question>
    <footer v-if="!showCompletionScreen" class="question-footer">
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
import Question from "./quiz-screen/Question"
import Helpers from "@/utils/Helpers"
import BackgroundImg from "@/assets/question-screen-bg.png"
import CompletionScreen from "./quiz-screen/CompletionScreen"
import { mapGetters } from "vuex"

export default {
  name: "quiz-screen",
  components: {
    CompletionScreen,
    Question,
  },
  props: {
    id: {
      type: [Number, String],
      required: true,
    },
  },
  data() {
    return {
      activeQuestionIndex: 0,
      showCompletionScreen: false,
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
    node() {
      return this.getNode(this.id)
    },
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
    handleSubmit() {
      this.showCompletionScreen = true
      this.$emit("submit")
    },
    next() {
      this.showCompletionScreen = false
      this.activeQuestionIndex++
    },
    prev() {
      this.showCompletionScreen = false
      this.activeQuestionIndex--
    },
  },
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/tyde-colors.scss";

.quiz-screen {
  display: flex;
  background-size: cover;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  padding: 24px;
  padding-left: 20%;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  min-height: 100%;
  color: black;
  z-index: 10;
  background-color: #fff;
  background-size: 80%;
  background-repeat: no-repeat;
  background-position: 0 80%;
}

.question-footer {
  margin-top: 1em;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.button-completion {
  background: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: inherit;
  margin-right: 3em;

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    color: #11a6d8;
  }

  p {
    margin: 1em auto 0;
    padding: 0;
    font-weight: 600;
  }
}

.button-nav {
  border-radius: 50%;
  height: 56px;
  width: 56px;
  background: $tyde-blue;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5em;
  color: white;
  margin: 0;
  margin-right: 12px;
  opacity: 1;
  transition: opacity 0.1s ease-out;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.6;
    pointer-events: none;
    cursor: not-allowed;
  }

  &:last-child {
    margin-right: 0;
  }
}

.question-step {
  margin: 0;
  padding: 0;
  font-weight: bold;
  font-size: 2.5em;
  color: $tyde-blue;
  margin-right: 32px;
}
</style>
