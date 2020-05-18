<template>
  <div
    class="question"
    :class="{ 'question-audio': recorderOpened, 'question-gf': formOpened }"
  >
    <button class="button-nav" @click="back">
      <i class="fas fa-arrow-left"></i>
    </button>
    <loading v-if="loading" label="Submitting..." />
    <div v-else>
      <speech-bubble class="question-title">
        <div class="question-title-step">
          {{ currentStep }}
        </div>
        <div v-if="question.isFollowUp && answers.length" class="follow-up">
          <div class="answer-container mx-auto mb-3">
            <h3 class="mb-4">{{ question.followUpText }}</h3>
            <tapestry-activity
              v-for="answer in answers"
              :key="answer.type"
              :type="answer.type"
              :entry="answer.entry"
              :src="answer.src"
            ></tapestry-activity>
          </div>
        </div>
        <h3>{{ question.text }}</h3>
      </speech-bubble>
      <gravity-form
        v-if="formOpened"
        :id="formId"
        :node="node"
        @submit="handleFormSubmit"
      ></gravity-form>
      <audio-recorder
        v-else-if="recorderOpened"
        :id="question.id"
        :node="node"
        @submit="handleAudioSubmit"
      />
      <div v-else>
        <div class="question-content">
          <p class="question-answer-text">I want to answer with...</p>
          <div class="button-container">
            <answer-button
              v-if="hasId('textId')"
              :completed="textFormCompleted"
              @click="openForm(question.answers.textId, 'textId')"
            >
              text
            </answer-button>
            <answer-button
              v-if="hasId('audioId')"
              :completed="audioRecorderCompleted"
              icon="microphone"
              @click="openRecorder"
            >
              audio
            </answer-button>
            <answer-button
              v-if="hasId('checklistId')"
              :completed="checklistFormCompleted"
              icon="tasks"
              @click="openForm(question.answers.checklistId, 'checklistId')"
            >
              checklist
            </answer-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import AnswerButton from "./AnswerButton"
import SpeechBubble from "../../SpeechBubble"
import GravityForm from "../GravityForm"
import Loading from "../../Loading"
import Helpers from "@/utils/Helpers"
import AudioRecorder from "@/components/AudioRecorder"
import TapestryActivity from "@/components/TapestryActivity"

export default {
  name: "question",
  components: {
    AnswerButton,
    SpeechBubble,
    GravityForm,
    Loading,
    AudioRecorder,
    TapestryActivity,
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
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      formOpened: false,
      formId: null,
      formType: "",
      recorderOpened: false,
      loading: false,
    }
  },
  computed: {
    ...mapGetters(["getEntry", "getQuestion"]),
    lastQuestion() {
      if (this.question.previousEntry) {
        return this.getQuestion(this.question.previousEntry)
      }
      return null
    },
    answers() {
      if (this.question.previousEntry) {
        const answeredTypes = Object.entries(this.lastQuestion.answers)
          .filter(entry => entry[1] && entry[1].length > 0)
          .map(i => i[0])
        return answeredTypes
          .map(type => this.getEntry(this.question.previousEntry, type))
          .filter(Boolean)
      }
      return []
    },
    options() {
      return Object.entries(this.question.answers).filter(
        opt => opt[1] && opt[1].length > 0
      )
    },
    textFormCompleted() {
      return !!(this.question.entries && this.question.entries.textId)
    },
    checklistFormCompleted() {
      return !!(this.question.entries && this.question.entries.checklistId)
    },
    audioRecorderCompleted() {
      return !!(this.question.entries && this.question.entries.audioId)
    },
  },
  created() {
    if (this.options.length === 1) {
      if (this.options[0][0] === "audioId") {
        this.openRecorder()
      } else {
        this.openForm(this.options[0][1], this.options[0][0])
      }
    }
  },
  methods: {
    ...mapActions(["completeQuestion", "saveAudio"]),
    back() {
      const wasOpened = this.formOpened || this.recorderOpened
      if (!wasOpened || this.options.length === 1) {
        this.$emit("back")
      }
      this.formOpened = false
      this.recorderOpened = false
    },
    openRecorder() {
      this.recorderOpened = true
    },
    openForm(id, answerType) {
      this.formId = id
      this.formType = answerType
      this.formOpened = true
    },
    async handleFormSubmit() {
      this.formOpened = false
      if (Helpers.canUserUpdateProgress(this.node)) {
        this.loading = true
        await this.completeQuestion({
          nodeId: this.node.id,
          answerType: this.formType,
          formId: this.formId,
          questionId: this.question.id,
        })
        this.loading = false
        this.$emit("submit")
      }
    },
    async handleAudioSubmit(audioFile) {
      this.recorderOpened = false
      this.loading = true
      await this.completeQuestion({
        nodeId: this.node.id,
        answerType: "audio",
        formId: this.formId,
        questionId: this.question.id,
      })
      await this.saveAudio({
        audio: audioFile.replace("data:audio/ogg; codecs=opus;base64,", ""),
        nodeId: this.node.id,
        questionId: this.question.id,
      })
      this.loading = false
      this.$emit("submit")
    },
    hasId(label) {
      const id = this.question.answers[label]
      return id && id.length > 0
    },
  },
}
</script>

<style lang="scss">
.question label.gfield_label {
  font-weight: bold;
  margin-top: 1em;
  font-size: 1.3em;
}
</style>

<style lang="scss" scoped>
@import "@/assets/styles/tyde-colors.scss";

button {
  margin: auto;
}

.answer-container {
  width: 75%;
}

.question {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;

  &.question-h5p {
    max-width: 600px;
  }

  &.question-gf {
    overflow: scroll;

    textarea {
      max-height: 180px !important;
    }

    .image-choices-choice-image-wrap img.image-choices-choice-image {
      max-width: 100px;
    }
  }
}

.question {
  .button-nav {
    border-radius: 50%;
    width: 80px;
    height: 80px;
    background: $tyde-blue;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3.5em;
    color: white;
    margin: 0;
    margin-right: 12px;
    opacity: 1;
    transition: all 0.1s ease-out;
    position: absolute;
    top: 24px;
    left: 24px;
    z-index: 20;

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

  .loading {
    background: #111;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 30;
  }

  &-title {
    position: relative;
    font-size: 1.5em;
    font-weight: 600 !important;
    padding-top: 16px;
    margin-bottom: 36px;

    &-step {
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
      font-size: 1.5em;
    }

    &:before {
      display: none;
    }

    + .recorder {
      margin-top: 4em;
    }
  }

  &-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .button-container {
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }

  &-answer-text {
    width: 100%;
    padding: 0;
    font-size: 1.75em;
    font-style: italic;
  }
}
</style>
