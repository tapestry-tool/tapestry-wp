<template>
  <quiz-screen v-if="showQuiz" :node="node" @close="showQuiz = false"></quiz-screen>
  <div
    v-else
    :class="[
      'end-screen',
      {
        'end-screen--hide': !show,
      },
    ]"
    :style="{ backgroundImage: backgroundUrl }"
  >
    <speech-bubble>
      We've got a question for you!
      <br />
      Do you wanna...
    </speech-bubble>
    <div class="button-container">
      <button
        v-if="showQuizButton"
        class="end-screen-button end-screen-button-quiz"
        @click="showQuiz = true"
      >
        <i class="fas fa-question-circle"></i>
        <p class="end-screen-button-text">{{ buttonText }}</p>
      </button>
      <button class="end-screen-button" @click="$emit('rewatch')">
        <i class="fas fa-play"></i>
        <p class="end-screen-button-text">Replay Video</p>
      </button>
      <button class="end-screen-button" @click="$emit('close')">
        <i class="fas fa-history"></i>
        <p class="end-screen-button-text">Come Back Later</p>
      </button>
      <button v-show="false" class="end-screen-button">
        <i class="far fa-times-circle"></i>
        <p class="end-screen-button-text">Favourite Video</p>
      </button>
    </div>
  </div>
</template>

<script>
import SpeechBubble from "../SpeechBubble"
import QuizScreen from "./quiz/QuizScreen"
import EndScreenBg from "../../assets/end-screen-bg.png"

export default {
  name: "end-screen",
  components: {
    QuizScreen,
    SpeechBubble,
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
      return allDone ? "Reanswer Question" : "Answer Question"
    },
    backgroundUrl() {
      return `url(${wpData.vue_uri}/${EndScreenBg.split("dist")[1]})`
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
</style>

<style scoped>
.end-screen {
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  color: black;
  opacity: 1;
  transition: opacity 0.4s ease-out;
  z-index: 10;

  padding: 24px;
  padding-left: 38%;
  padding-right: 64px;
}

.end-screen--hide {
  opacity: 0;
  pointer-events: none;
}

.end-screen-button {
  background: none;
  background-color: var(--tyde-blue);
  padding: 4px 32px;
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: white;
  border-radius: 4px;
  opacity: 1;
  transition: opacity 0.1s ease-out;
  font-size: 32px;
  margin-bottom: 32px;
}

.end-screen-button:last-child {
  margin-bottom: 0;
}

.end-screen-button-quiz {
  background-color: var(--tyde-orange);
}

.end-screen-button:hover {
  opacity: 0.9;
}

.end-screen-button-text {
  margin: 1em auto 0;
  padding: 0;
  font-weight: 600;
  margin-left: 32px;
}

.button-container {
  display: flex;
  flex-direction: column;
  padding-left: 96px;
  margin-top: 64px;
}
</style>
