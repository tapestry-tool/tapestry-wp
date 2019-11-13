<template>
  <b-tab title="Quiz">
    <b-form-group>
      <b-form-checkbox v-model="canAddQuiz">Add Quiz</b-form-checkbox>
    </b-form-group>
    <div v-if="canAddQuiz" class="quizzes">
      <b-card
        v-for="(quiz, index) in quizzes"
        :key="quiz.id"
        bg-variant="light"
        class="mb-3"
      >
        <b-form-group class="mb-0">
          <b-row align-v="center" class="mb-2 mx-0">
            <i :class="`fas fa-${quiz.icon} icon-form`"></i>
            <p class="font-weight-bold p-0 m-0">
              {{ getGroupTitle(quiz, index) }}
            </p>
            <b-button
              class="ml-auto"
              size="sm"
              variant="outline-danger"
              @click="deleteQuiz(quiz.id)"
            >
              Delete
            </b-button>
          </b-row>
          <b-form-group label="Quiz Title">
            <b-form-input v-model="quiz.title" />
          </b-form-group>
          <b-form-group label="Quiz Type">
            <b-form-select v-model="quiz.type" :options="typeOptions" />
          </b-form-group>
          <b-form-group label="Quiz Content ID">
            <b-form-input v-model="quiz.contentId" />
          </b-form-group>
          <b-form-group label="Quiz Icon">
            <b-form-select v-model="quiz.icon" :options="icons" />
          </b-form-group>
        </b-form-group>
      </b-card>
    </div>
    <b-row v-if="canAddQuiz" class="mx-0">
      <b-button variant="primary" @click="addQuiz">
        <i class="fas fa-plus icon"></i>
        Add Quiz
      </b-button>
    </b-row>
  </b-tab>
</template>

<script>
import Helpers from "../../utils/Helpers"

const defaultQuiz = {
  contentId: "",
  icon: "microphone",
  title: "",
  type: "H5P Audio Recorder",
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
      canAddQuiz: Boolean(this.node.quizzes && this.node.quizzes.length),
      quizzes: this.node.quizzes,
      typeOptions: ["H5P Audio Recorder"],
      icons: ["microphone"],
    }
  },
  watch: {
    canAddQuiz(isAdding) {
      if (isAdding && !this.quizzes.length) {
        this.addQuiz()
      }
    },
    quizzes(newQuizzes) {
      this.$set(this.node, "quizzes", newQuizzes)
    },
  },
  methods: {
    addQuiz() {
      this.quizzes = [...this.quizzes, { ...defaultQuiz, id: Helpers.createUUID() }]
    },
    deleteQuiz(id) {
      this.quizzes = this.quizzes.filter(quiz => quiz.id !== id)
    },
    getGroupTitle(quiz, index) {
      return `Quiz #${index + 1}: ${quiz.title || "Untitled"}`
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

.quizzes {
  margin-bottom: 1em;
}
</style>
