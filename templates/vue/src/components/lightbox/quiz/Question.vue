<template>
  <div class="question">
    <loading v-if="loadingForm" label="Loading form..." />
    <div
      v-else-if="formOpened"
      @submit="handleFormSubmit(question.id)"
      v-html="formHtml"
    ></div>
    <iframe
      ref="h5p"
      v-else-if="h5pRecorderUrl"
      allowfullscreen="false"
      :src="h5pRecorderUrl"
      width="300"
      height="300"
      @load="handleLoad"
    ></iframe>
    <div v-else>
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
          <answer-button
            v-if="hasId('audioId')"
            icon="microphone"
            @click="openRecorder()"
          >
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
import SpeechBubble from "../../SpeechBubble"
import TapestryAPI from "../../../services/TapestryAPI"
import Loading from "../../Loading"

export default {
  name: "question",
  components: {
    AnswerButton,
    SpeechBubble,
    Loading,
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
      loadingForm: false,
    }
  },
  methods: {
    async openRecorder() {
      this.h5pRecorderUrl = `http://localhost:8888/tapestry-wp/wp-admin/admin-ajax.php?action=h5p_embed&id=34`
    },
    handleLoad() {
      const h5pObj = this.$refs.h5p.contentWindow.H5P
      this.$emit('h5p-recorder-saver-loaded', { loadedH5pId: h5pObj.instances[0].contentId })
    },
    async openForm(id) {
      if (!id) {
        return
      }

      // Clear previous form data
      delete window[`gf_submitting_${id}`]
      this.formHtml = ""

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
    handleFormSubmit(questionId) {
      this.formOpened = false
      this.$emit("form-submitted", questionId)
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
</style>
