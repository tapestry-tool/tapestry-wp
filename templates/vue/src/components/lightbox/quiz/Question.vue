<template>
  <div
    class="question"
    :class="{ 'question-h5p': recorderOpened, 'question-gf': formOpened }"
  >
    <gravity-form
      v-if="formOpened"
      :id="formId"
      @submit="handleFormSubmit"
    ></gravity-form>
    <loading v-if="loading" label="Submitting..." />
    <h5p-iframe v-else-if="recorderOpened" :media-u-r-l="h5pRecorderUrl" />
    <div v-if="!formOpened && !recorderOpened">
      <h1 class="question-title">
        {{ question.text }}
      </h1>
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
import { mapActions, mapGetters } from "vuex"
import AnswerButton from "./AnswerButton"
import GravityForm from "./GravityForm"
import Loading from "../../Loading"
import H5PIframe from "../H5PIframe"

export default {
  name: "question",
  components: {
    AnswerButton,
    GravityForm,
    Loading,
    "h5p-iframe": H5PIframe,
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
      formId: null,
      formType: "",
      recorderOpened: false,
      h5pRecorderUrl: "",
      loading: false,
    }
  },
  computed: {
    ...mapGetters(["selectedNode"]),
  },
  methods: {
    ...mapActions(["completeQuestion"]),
    openRecorder(id) {
      if (id) {
        this.recorderOpened = true
        this.$emit("recorder-opened")
        this.h5pRecorderUrl = `${adminAjaxUrl}?action=h5p_embed&id=${id}`
      }
    },
    openForm(id, answerType) {
      this.formId = id
      this.formType = answerType
      this.formOpened = true
    },
    async handleFormSubmit() {
      this.formOpened = false
      this.loading = true
      await this.completeQuestion({
        nodeId: this.selectedNode.id,
        answerType: this.formType,
        formId: this.formId,
        questionId: this.question.id,
      })
      this.loading = false
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

  &.question-gf {
    overflow: scroll;
    .image-choices-choice-image-wrap img.image-choices-choice-image {
      max-width: 100px;
    }
  }
}

.question-title {
  position: relative;
  font-size: 48px;
  font-weight: 600 !important;
  padding-top: 16px;
  margin-bottom: 36px;
}

.question-title:before {
  display: none;
}

.question-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
