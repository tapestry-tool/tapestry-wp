<template>
  <div class="question">
    <h1 class="question-title">
      {{ question.text }}
      <div class="question-title-bubble" :style="{ backgroundImage: bubbleImage }"></div>
    </h1>
    <div class="question-content">
      <p class="question-answer-text">I want to answer with...</p>
      <div class="button-container">
        <answer-button>text</answer-button>
        <answer-button icon="microphone">audio</answer-button>
        <answer-button icon="tasks">checklist</answer-button>
      </div>
    </div>
  </div>
</template>

<script>
import AnswerButton from "./AnswerButton"
import SpeechBubble from "../../../assets/speech-bubble-end.png"

export default {
  name: 'question',
  components: {
    AnswerButton
  },
  props: {
    question: {
      type: Object,
      required: true
    }
  },
  computed: {
    bubbleImage() {
      return `url(${wpData.vue_uri}/${SpeechBubble.split("dist")[1]})`
    }
  }
}
</script>

<style scoped>
.question {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
}

.question-title {
  position: relative;
  font-size: 28px;
  font-style: italic;
  border: 2px solid black;
  padding: 12px 16px;
  border-radius: 1em;
  margin-bottom: 36px;
}

.question-title:after {
  content: "";
  position: absolute;
  left: 10%;
  bottom: -2px;
  width: 15px;
  height: 2px;
  background: black;
}

.question-title-bubble {
  position: absolute;
  left: 10%;
  bottom: -31px;
  width: 46px;
  height: 32px;
  background-size: cover;
}

.question-title:before {
  display: none;
}

.question-content {
  padding-left: 30%;
  width: 100%;
}

.question-answer-text {
  width: 100%;
  padding: 0;
  font-size: 28px;
  font-style: italic;
}

.button-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>
