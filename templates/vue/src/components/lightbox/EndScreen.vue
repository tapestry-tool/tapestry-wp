<template>
  <div class="end-screen" :style="{ backgroundImage: backgroundUrl }">
    <speech-bubble v-if="showQuizButton">
      We've got a question for you!
      <br />
      Do you wanna...
    </speech-bubble>
    <div class="button-container" :class="{ 'pt-4': !showQuizButton }">
      <button
        v-if="showQuizButton"
        class="end-screen-button button-quiz"
        @click="$emit('show-quiz')"
      >
        <i class="fas fa-question-circle"></i>
        <p class="end-screen-button-text">{{ buttonText }}</p>
      </button>
      <button class="end-screen-button" @click="$emit('rewatch')">
        <i class="fas fa-play"></i>
        <p class="end-screen-button-text">Replay Video</p>
      </button>
      <button
        v-if="!showQuizButton"
        class="end-screen-button"
        @click="$emit('close')"
      >
        <i class="fas fa-arrow-circle-right"></i>
        <p class="end-screen-button-text">Continue</p>
      </button>
      <button
        v-if="showQuizButton"
        class="end-screen-button"
        @click="$emit('close')"
      >
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
import EndScreenBg from "../../assets/end-screen-bg.png"

export default {
  name: "end-screen",
  components: {
    SpeechBubble,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
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

<style lang="scss" scoped>
@import "@/assets/styles/tyde-colors.scss";

.end-screen {
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  min-height: 100%;
  background-size: cover;
  color: black;
  opacity: 1;
  transition: opacity 0.4s ease-out;
  z-index: 10;
  padding: 24px;
  padding-left: 38%;
  padding-right: 64px;

  .button-container {
    display: flex;
    flex-direction: column;
    padding-left: 96px;
    margin-top: 64px;

    button {
      background: none;
      background-color: $tyde-blue;
      padding: 4px 32px;
      margin: 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      color: white;
      border-radius: 4px;
      opacity: 1;
      transition: opacity 0.1s ease-out;
      font-size: 2em;
      margin-bottom: 32px;

      &:last-child {
        margin-right: 0;
      }

      &:hover {
        opacity: 0.9;
      }

      .button-quiz {
        background-color: $tyde-orange;
      }

      p {
        margin: 0;
        padding: 0;
        font-weight: 600;
        margin-left: 32px;
      }
    }
  }
}
</style>
