<template>
  <div class="question">
    <div v-show="formOpened" ref="form-container"></div>
    <div v-show="!formOpened">
      <h1 class="question-title">
        {{ question.text }}
        <div class="question-title-bubble" :style="{ backgroundImage: bubbleImage }"></div>
      </h1>
      <div class="question-content">
        <p class="question-answer-text">I want to answer with...</p>
        <div class="button-container">
          <answer-button @click="openForm(question.answers.textId)">text</answer-button>
          <answer-button icon="microphone">audio</answer-button>
          <answer-button @click="openForm(question.answers.checklistId)" icon="tasks">checklist</answer-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AnswerButton from "./AnswerButton"
import TapestryAPI from "@/services/TapestryAPI"
import SpeechBubble from "../../../assets/speech-bubble-end.png"

export default {
  name: 'question',
  components: {
    AnswerButton
  },
  data() {
    return {
      formOpened: false
    }
  },
  props: {
    question: {
      type: Object,
      required: true
    }
  },
  methods: {
    async openForm(id) {
      if (!id) {
        return;
      }
      const TapestryApi = new TapestryAPI(wpPostId)
      try {
        const response = await TapestryApi.getGravityForm(id)
        if (response) {
          const gravityForm = document.createElement('div')
          gravityForm.innerHTML = response.data

          this.$refs['form-container'].appendChild(gravityForm)
          this.formOpened = true
          this.$emit('form-opened')
        }
      } catch (e) {
        console.error(e)
      }
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
button {
  margin: auto;
}
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
