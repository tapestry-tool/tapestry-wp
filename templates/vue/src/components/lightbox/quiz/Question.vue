<template>
  <div
    class="question"
    :class="{ 'question-h5p': recorderOpened, 'question-gf': formOpened }"
  >
    <gravity-form
      v-if="formOpened"
      :id="formId"
      :entry="formEntry"
      :form="formHtml"
      @submit="handleFormSubmit"
    ></gravity-form>
    <iframe
      v-else-if="recorderOpened"
      ref="h5p"
      allowfullscreen="false"
      :src="h5pRecorderUrl"
      frameBorder="0"
      @load="handleLoad"
    ></iframe>
    <loading v-if="loadingForm" class="loading" :label="loadingText" />
    <div v-if="!formOpened && !recorderOpened">
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
            @click="openForm(question.answers.textId, 'textId')"
          >
            text
          </answer-button>
          <answer-button
            v-if="hasId('audioId')"
            icon="microphone"
            @click="openRecorder(question.answers.audioId)"
          >
            audio
          </answer-button>
          <answer-button
            v-if="hasId('checklistId')"
            icon="tasks"
            @click="openForm(question.answers.checklistId, 'checklistId')"
          >
            checklist
          </answer-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import AnswerButton from "./AnswerButton"
import SpeechBubble from "../../SpeechBubble"
import GravityForm from "./GravityForm"
import Loading from "../../Loading"
import TapestryAPI from "../../../services/TapestryAPI"

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
      recorderOpened: false,
      formHtml: "",
      formType: "",
      formEntry: null,
      loadingForm: false,
      h5pRecorderUrl: "",
    }
  },
  computed: {
    ...mapGetters(["selectedNode"]),
    loadingText() {
      return this.formOpened ? "Submitting..." : "Loading form..."
    },
  },
  methods: {
    openRecorder(id) {
      if (id) {
        this.recorderOpened = true
        this.$emit("recorder-opened")
        this.h5pRecorderUrl = `${adminAjaxUrl}?action=h5p_embed&id=${id}`
      }
    },
    handleLoad() {
      const h5pObj = this.$refs.h5p.contentWindow.H5P
      const loadedH5pId = h5pObj.instances[0].contentId
      if (loadedH5pId) {
        this.$emit("h5p-recorder-saver-loaded", { loadedH5pId })
      }
    },
    async openForm(id, answerType) {
      if (!id) {
        return
      }

      // Clear previous form data
      delete window[`gf_submitting_${id}`]
      this.formHtml = ""
      this.formId = id
      this.formEntry = this.question.entries && this.question.entries[answerType]
      this.formType = answerType

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
    handleFormSubmit({ id, success, response }) {
      if (!success) {
        delete window[`gf_submitting_${id}`]
        this.formHtml = response
        return
      }
      this.formOpened = false
      this.$emit("form-submitted", {
        questionId: this.question.id,
        formId: this.formId,
        answerType: this.formType,
      })
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
button {
  margin: auto;
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
