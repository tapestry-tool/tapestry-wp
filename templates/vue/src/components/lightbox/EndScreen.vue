<template>
  <div class="end-screen" :style="{ backgroundImage: backgroundUrl }">
    <speech-bubble v-if="showQuizButton">
      <h3>
        We've got a question for you!
        <br />
        Do you wanna...
      </h3>
    </speech-bubble>
    <div class="end-screen-button-container" :class="{ 'pt-4': !showQuizButton }">
      <button
        v-if="showQuizButton"
        class="end-screen-button button-quiz"
        @click="handleClick($event, 'show-quiz')"
      >
        <i class="fas fa-question-circle"></i>
        <p class="end-screen-button-text">{{ buttonText }}</p>
      </button>
      <button class="end-screen-button" @click="handleClick($event, 'rewatch')">
        <i class="fas fa-play"></i>
        <p class="end-screen-button-text">Replay Video</p>
      </button>
      <button
        v-if="!showQuizButton"
        class="end-screen-button"
        @click="handleClick($event, 'close')"
      >
        <i class="fas fa-arrow-circle-right"></i>
        <p class="end-screen-button-text">Continue</p>
      </button>
      <button
        v-if="showQuizButton"
        class="end-screen-button"
        @click="handleClick($event, 'close')"
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
  methods: {
    handleClick(evt, type) {
      globals.recordAnalyticsEvent("user", "click", "end-screen", this.node.id, {
        x: evt.clientX,
        y: evt.clientY,
      })
      this.$emit(type)
    },
  },
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
