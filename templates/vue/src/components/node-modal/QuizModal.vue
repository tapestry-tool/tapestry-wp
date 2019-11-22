<template>
  <b-tab title="Quiz">
    <b-form-group>
      <b-form-checkbox v-model="canAddQuestion">Add Question</b-form-checkbox>
    </b-form-group>
    <div v-if="canAddQuestion" class="quiz">
      <b-card
        v-for="(question, index) in questions"
        :key="question.id"
        bg-variant="light"
        class="mb-3"
      >
        <b-form-group class="mb-0">
          <b-row align-v="center" class="mb-2 mx-0">
            <p class="font-weight-bold p-0 m-0 question-text">
              {{ getGroupTitle(question, index) }}
            </p>
            <b-button
              class="ml-auto del-button"
              size="sm"
              variant="outline-danger"
              @click="deleteQuestion(question.id)"
            >
              Delete
            </b-button>
          </b-row>
          <b-form-group label="Question Text">
            <b-form-input v-model="question.text" />
          </b-form-group>
          <b-form-group label="Question Answer Types">
            <b-form-group label="Textbox Gravity Form ID">
              <b-form-input v-model="question.answers.textId" />
            </b-form-group>
            <b-form-group label="H5P Audio Recorder ID">
              <b-form-input v-model="question.answers.audioId" />
            </b-form-group>
            <b-form-group label="Checklist Gravity Form ID">
              <b-form-input v-model="question.answers.checklistId" />
            </b-form-group>
          </b-form-group>
        </b-form-group>
      </b-card>
    </div>
    <b-row v-if="canAddQuestion" class="mx-0">
      <b-button variant="primary" @click="addQuestion">
        <i class="fas fa-plus icon"></i>
        Add Question
      </b-button>
    </b-row>
  </b-tab>
</template>

<script>
import Helpers from "../../utils/Helpers"

const defaultQuestion = {
  text: "",
  answers: {
    textId: "",
    audioId: "",
    checklistId: "",
  },
}

export default {
  name: "quiz-modal",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      canAddQuestion: Boolean(this.node.quiz && this.node.quiz.length),
      questions: this.node.quiz,
      typeOptions: ["H5P Audio Recorder"],
      icons: ["microphone"],
    }
  },
  watch: {
    canAddQuestion(isAdding) {
      if (isAdding && !this.questions.length) {
        this.addQuestion()
      }
    },
    questions(newQuestions) {
      this.$set(this.node, "quiz", newQuestions)
    },
  },
  methods: {
    addQuestion() {
      this.questions = [
        ...this.questions,
        {
          id: Helpers.createUUID(),
          text: "",
          answers: { ...defaultQuestion.answers },
        },
      ]
    },
    deleteQuestion(id) {
      this.questions = this.questions.filter(question => question.id !== id)
    },
    getGroupTitle(question, index) {
      return `Question #${index + 1}: ${question.text || "Untitled"}`
    },
  },
}
</script>

<style scoped>
.icon {
  margin-right: 4px;
}

.icon-form {
  margin-right: 1em;
}

.quiz {
  margin-bottom: 1em;
}

.question-text {
  flex: 10;
}

.del-button {
  flex: 1;
}
</style>
