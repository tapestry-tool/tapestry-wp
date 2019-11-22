<template>
  <div class="question">
    <gravity-form
      v-if="formOpened"
      :id="formId"
      :form="formHtml"
      @submit="handleFormSubmit"
    ></gravity-form>
    <loading v-if="loadingForm" class="loading" :label="loadingText" />
    <div v-if="!formOpened">
      <h1 class="question-title">
      <speech-bubble class="question-title">
        <div class="question-title-step">
          {{ currentStep }}
        </div>
        {{ question.text }}
      </speech-bubble>
      <div class="question-content">
        <p class="question-answer-text">I want to answer with...</p>
        <div class="button-container">
          <answer-button
            v-if="hasId('textId')"
            @click="openForm(question.answers.textId)"
          >
            text
          </answer-button>
          <answer-button v-if="hasId('audioId')" icon="microphone">
            audio
          </answer-button>
          <answer-button
            v-if="hasId('checklistId')"
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
import GravityForm from "./GravityForm"
import Loading from "../../Loading"
import TapestryAPI from "../../../services/TapestryAPI"
import Loading from "../../Loading"

export default {
  name: "question",
  components: {
    AnswerButton,
    SpeechBubble,
    Loading,
    GravityForm,
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
      formHtml: "",
      formId: null,
      loadingForm: false,
    }
  },
  computed: {
    loadingText() {
      return this.formOpened ? "Submitting..." : "Loading form..."
    },
  },
  methods: {
    async openForm(id) {
      if (!id) {
        return
      }

      // Clear previous form data
      delete window[`gf_submitting_${id}`]
      this.formHtml = ""
      this.formId = id

      const TapestryApi = new TapestryAPI(wpPostId)
      try {
        this.loadingForm = true
        const response = await TapestryApi.getGravityForm(id)
        this.loadingForm = false
        if (response) {
          this.formHtml = response.data
          this.formOpened = true
          this.$emit("form-opened")
        }
      } catch (e) {
        this.loadingForm = false
        console.error(e)
      }
    },
    handleFormSubmit({ id, success, formData, response }) {
      if (!success) {
        delete window[`gf_submitting_${id}`]
        this.formHtml = response
        return
      }
      // TODO: Save form submission somehow
      this.formOpened = false
      this.$emit("form-submitted", this.question.id)
    },
    hasId(label) {
      const id = this.question.answers[label]
      return id && id.length > 0
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
  justify-content: space-between;
  height: 100%;
  width: 100%;
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
  justify-content: center;
}

.loading {
  background: white;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.9;
  z-index: 30;
}
</style>
