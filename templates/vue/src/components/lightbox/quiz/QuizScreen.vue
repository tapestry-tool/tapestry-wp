<template>
  <div class="quiz-screen" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <button class="button-nav button-nav-menu" @click="back">
      <i class="fas fa-arrow-left"></i>
    </button>
    <question
      :question="activeQuestion"
      :current-step="currentQuestionText"
      @form-opened="formOpened = true"
      @form-submitted="formOpened = false"
    ></question>
    <footer class="question-footer">
      <p class="question-step">{{ currentQuestionText }}</p>
      <button class="button-nav" :disabled="!hasPrev" @click="prev">
        <i class="fas fa-arrow-left"></i>
      </button>
      <button
        v-show="!formOpened"
        class="button-nav"
        :disabled="!hasNext"
        @click="next"
      >
        <i class="fas fa-arrow-right"></i>
      </button>
    </footer>
  </div>
</template>

<script>
import Question from "./Question"
import BackgroundImg from "../../../assets/11-18-QuestionScreen.png"

export default {
  name: "quiz-screen",
  components: {
    Question,
  },
  props: {
    quiz: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      activeQuestionIndex: 0,
      formOpened: false,
    }
  },
  computed: {
    activeQuestion() {
      return this.quiz[this.activeQuestionIndex]
    },
    backgroundImage() {
      return `${wpData.vue_uri}/${BackgroundImg.split("dist")[1]}`
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
    next() {
      this.activeQuestionIndex++
    },
    prev() {
      this.activeQuestionIndex--
    },
    back() {
      this.$emit("close")
    },
  },
}
</script>

<style>
:root {
  --tyde-blue: #1074bb;
  --tyde-orange: #f79621;
  --tyde-orange-light: #f9b664;
}

.quiz-screen {
  display: flex;
  background-size: cover;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  padding: 24px;
  padding-left: 25%;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  color: black;
  z-index: 10;
}
</style>

<style scoped>
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
}

.button-nav:hover {
  opacity: 0.8;
}

.button-nav:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-nav:last-child {
  margin-right: 0;
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
