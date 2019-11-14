<template>
  <quiz-screen v-if="showQuiz" :quiz="node.quiz"></quiz-screen>
  <div
    v-else
    :class="[
      'end-screen',
      {
        'end-screen--hide': !show,
      },
    ]"
  >
    <button v-if="showQuizButton" class="end-screen-button" @click="showQuiz = true">
      <i class="fas fa-question-circle fa-4x"></i>
      <p class="end-screen-button-text">{{ buttonText }}</p>
    </button>
    <button class="end-screen-button" @click="$emit('rewatch')">
      <i class="fas fa-redo fa-4x"></i>
      <p class="end-screen-button-text">Rewatch</p>
    </button>
    <button class="end-screen-button" @click="$emit('close')">
      <i class="far fa-times-circle fa-4x"></i>
      <p class="end-screen-button-text">Close</p>
    </button>
  </div>
</template>

<script>
import QuizScreen from "./quiz/QuizScreen"

export default {
  name: "end-screen",
  components: {
    QuizScreen
  },
  props: {
    node: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      showQuiz: false
    }
  },
  computed: {
    showQuizButton() {
      return Boolean(this.node.quiz && this.node.quiz.length)
    },
    buttonText() {
      const allDone = this.node.quiz.every(question => question.completed)
      return allDone ? "Retake Quiz" : "Take Quiz"
    }
  }
}
</script>

<style scoped>
.end-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  color: black;
  opacity: 1;
  transition: opacity 0.4s ease-out;
  z-index: 10;
}

.end-screen--hide {
  opacity: 0;
  pointer-events: none;
}

.end-screen-button {
  background: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: inherit;
  margin-right: 3em;
}

.end-screen-button:last-child {
  margin-right: 0;
}

.end-screen-button:hover {
  color: #11a6d8;
}

.end-screen-button-text {
  margin: 0;
  padding: 0;
  font-weight: 600;
  margin-top: 1em;
}
</style>
