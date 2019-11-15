<template>
  <div class="question">
    <div v-show="formOpened" ref="form-container"></div>
    <div v-show="!formOpened">
      <speech-bubble class="question-title">
        <div class="question-title-step">
          {{ currentStep }}
        </div>
        {{ question.text }}
      </speech-bubble>
      <div class="question-content">
        <p class="question-answer-text">I want to answer with...</p>
        <div class="button-container">
          <answer-button @click="openForm(question.answers.textId)">
            text
          </answer-button>
          <answer-button icon="microphone">audio</answer-button>
          <answer-button
            icon="tasks"
            @click="openForm(question.answers.checklistId)"
          >
            checklist
          </answer-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AnswerButton from "./AnswerButton"
import SpeechBubble from "../../SpeechBubble"
import TapestryAPI from "../../../services/TapestryAPI"

export default {
  name: "question",
  components: {
    AnswerButton,
    SpeechBubble,
  },
  props: {
    question: {
      type: Object,
      required: true,
    },
    currentStep: {
      type: String,
      required: false,
      default: "1/1",
    },
  },
  data() {
    return {
      formOpened: false,
    }
  },
  methods: {
    async openForm(id) {
      if (!id) {
        return
      }
      const TapestryApi = new TapestryAPI(wpPostId)
      try {
        const response = await TapestryApi.getGravityForm(id)
        if (response) {
          const gravityForm = document.createElement("div")
          gravityForm.innerHTML = response.data

          this.$refs["form-container"].appendChild(gravityForm)
          this.formOpened = true
          this.$emit("form-opened")
        }
      } catch (e) {
        console.error(e)
      }
    },
  },
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
  height: 100%;
}

.question-title {
  margin-bottom: 36px;
}

.question-title-step {
  position: absolute;
  border: 2px solid black;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  top: -16px;
  left: -24px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.question-title:before {
  display: none;
}

.question-content {
  padding-left: 30%;
  width: 100%;
  height: 100%;
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
