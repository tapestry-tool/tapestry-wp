<template>
  <div class="question">
    <button v-if="formOpened" class="button-nav" @click="back">
      <i class="fas fa-arrow-left"></i>
    </button>
    <loading v-if="loading" label="Submitting..." />
    <div v-else>
      <div
        v-if="question.followUp.nodeId && question.followUp.questionId"
        class="follow-up"
      >
        <div
          v-if="previousQuestionAnswers.length"
          class="answer-container mx-auto mb-3"
        >
          <h3 class="mb-4">
            {{ question.followUp.text || "Previously, you said:" }}
          </h3>
          <!-- TODO fix this later tapestry-activity
            v-for="answer in previousQuestionAnswers"
            :key="answer.type"
            :type="answer.type"
            :entry="answer.entry"
          ></tapestry-activity-->
        </div>
        <div v-else>
          <p>You haven't done the previous activity yet.</p>
        </div>
      </div>
      <h1 class="question-title">
        {{ question.text }}
      </h1>
      <b-alert
        v-if="!isLoggedIn"
        show
        variant="warning"
        class="loggedout-alert mx-auto"
      >
        Please login to have your answers saved.
      </b-alert>
      <div class="question-body">
        <!--TODO remove this after also removing its requirements gravity-form
          v-if="formOpened"
          :id="formId"
          class="answer"
          @submit="handleFormSubmit"
        ></gravity-form-->
        <text-question
          v-if="formOpened && formType === 'text'"
          :question="question"
          :mult-line="question.answerTypes.text.isMultiLine"
          :placeholder="question.answerTypes.text.placeholder"
          :answer="answer"
          @submit="handleSubmit"
        ></text-question>
        <audio-recorder
          v-else-if="formOpened && formType === 'audio'"
          :id="question.id"
          @submit="handleSubmit"
        />
        <div v-else class="question-answer-types">
          <p class="question-answer-text">I want to answer with...</p>
          <div class="button-container">
            <answer-button
              v-if="question.answerTypes.text.enabled"
              :completed="answers.text"
              @click="openForm('text')"
            >
              text
            </answer-button>
            <answer-button
              v-if="question.answerTypes.audio.enabled"
              :completed="answers.audio"
              icon="microphone"
              @click="openForm('audio')"
            >
              audio
            </answer-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex"
import client from "@/services/TapestryAPI"
import AnswerButton from "./AnswerButton"
import AudioRecorder from "./AudioRecorder"
import TextQuestion from "./TextQuestion"
import Loading from "@/components/common/Loading"
// import TapestryActivity from "./TapestryActivity"
import * as wp from "@/services/wp"

export default {
  name: "question",
  components: {
    AnswerButton,
    AudioRecorder,
    TextQuestion,
    Loading,
    // TapestryActivity,
  },
  props: {
    question: {
      type: Object,
      required: true,
    },
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      formOpened: false,
      formType: "",
      answers: {},
    }
  },
  computed: {
    // ...mapGetters(["getEntry", "getQuestion"]),
    isLoggedIn() {
      return wp.isLoggedIn()
    },
    lastQuestion() {
      // TODO: fix this later
      // if (this.question.followUp) {
      //   return this.getQuestion(this.question.previousEntry)
      // }
      return null
    },
    previousQuestionAnswers() {
      // TODO: fix this later
      // if (this.question.followUp) {
      //   const answeredTypes = Object.entries(this.lastQuestion.answers)
      //     .filter(entry => entry[1] && entry[1].length > 0)
      //     .map(i => i[0])
      //   return answeredTypes
      //     .map(type => this.getEntry(this.question.previousEntry, type))
      //     .filter(Boolean)
      // }
      return []
    },
    enabledAnswerTypes() {
      return Object.entries(this.question.answerTypes).filter(
        answerType => answerType.enabled
      )
    },
    answer() {
      if (this.formOpened && this.answers[this.formType] !== undefined) {
        return this.answers[this.formType]
      }
      return null
    },
  },
  created() {
    this.answers = this.getAnswers(this.node.id, this.question.id)
    if (this.enabledAnswerTypes.length === 1) {
      this.formType = Object.keys(this.enabledAnswerTypes).pop()
      this.formOpened = true
    }
  },
  methods: {
    ...mapActions(["completeQuestion", "saveAudio"]),
    back() {
      client.recordAnalyticsEvent("user", "back", "question", this.question.id)
      this.formOpened = false
    },
    openForm(answerType) {
      client.recordAnalyticsEvent(
        "user",
        "click",
        "answer-button",
        this.question.id,
        {
          type: answerType,
        }
      )
      this.formType = answerType
      this.formOpened = true
    },
    async handleSubmit(formData) {
      this.formOpened = false
      this.loading = true

      if (!this.isLoggedIn) {
        return this.$emit("submit")
      }

      let submittedAnswer = null

      switch (this.formType) {
        case "audio": {
          const audioFile = formData
          const savedUrl = await this.saveAudio({
            audio: audioFile.replace("data:audio/ogg; codecs=opus;base64,", ""),
            nodeId: this.node.id,
            questionId: this.question.id,
          })
          submittedAnswer = { url: savedUrl }
          break
        }
        default: {
          submittedAnswer = formData
          break
        }
      }

      await this.completeQuestion({
        nodeId: this.node.id,
        questionId: this.question.id,
        answerType: this.formType,
        answer: submittedAnswer,
      })

      this.loading = false
      client.recordAnalyticsEvent("user", "submit", "question", this.question.id, {
        type: this.formType,
      })
      this.$emit("submit")
    },
  },
}
</script>

<style lang="scss" scoped>
button {
  margin: auto;
}

.answer-container {
  width: 75%;
}

.question {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  width: 100%;

  .button-nav {
    border-radius: 50%;
    width: 80px;
    height: 80px;
    background: #262626;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 56px;
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
      background: #11a6d8;
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
    font-size: 28px;
    font-weight: 600 !important;
    padding-top: 16px;
    margin-bottom: 36px;

    &:before {
      display: none;
    }

    + .recorder {
      margin-top: 4em;
    }
  }

  &-body {
    min-height: 250px;
  }

  .loggedout-alert {
    max-width: 500px;
  }

  &-form {
    max-width: 500px;
    margin: 0 auto;
  }

  &-answer-types {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .question-answer-text {
      width: 100%;
      padding: 0;
      font-size: 28px;
      font-style: italic;
    }

    .button-container {
      width: auto;
      display: flex;
      justify-content: center;

      > * {
        margin: 0 15px;
      }
    }
  }
}
</style>
