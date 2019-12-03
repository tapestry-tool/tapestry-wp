<template>
  <quiz-screen v-if="showQuiz" :node="node" @close="showQuiz = false" @h5p-recorder-saver-loaded="h5pRecorderSaverLoaded"></quiz-screen>
  <div
    v-else
    :class="[
      'end-screen',
      {
        'end-screen--hide': !show,
      },
    ]"
  >
    <button v-if="showQuizButton" @click="showQuiz = true">
      <i class="fas fa-question-circle fa-4x"></i>
      <p>{{ buttonText }}</p>
    </button>
    <button @click="$emit('rewatch')">
      <i class="fas fa-redo fa-4x"></i>
      <p>Rewatch</p>
    </button>
    <button @click="$emit('close')">
      <i class="far fa-times-circle fa-4x"></i>
      <p>Close</p>
    </button>
  </div>
</template>

<script>
import QuizScreen from "./quiz/QuizScreen"

export default {
  name: "end-screen",
  components: {
    QuizScreen,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    show: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      showQuiz: false,
    }
  },
  computed: {
    showQuizButton() {
      return Boolean(this.node.quiz && this.node.quiz.length)
    },
    buttonText() {
      const allDone = this.node.quiz.every(question => question.completed)
      return allDone ? "Retake Quiz" : "Take Quiz"
    },
  },
  methods: {
    h5pRecorderSaverLoaded(event) {
      this.$emit("h5p-recorder-saver-loaded", { loadedH5pId: event.loadedH5pId })
    },
  }
}
</script>

<style lang="scss" scoped>
.end-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #111;
  color: #eee;
  opacity: 1;
  transition: opacity 0.4s ease-out;
  z-index: 10;

  &.end-screen--hide {
    opacity: 0;
    pointer-events: none;
  }

  button {
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
}
</style>
