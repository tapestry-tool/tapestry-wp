<template>
  <b-tab title="Quiz">
    <b-form-group>
      <b-form-checkbox v-model="canAddQuiz">Add Quiz</b-form-checkbox>
    </b-form-group>
    <div v-if="canAddQuiz" class="quizzes">
      <b-card v-for="(quiz, index) in quizzes" :key="index" bg-variant="light">
        <b-form-group class="mb-0">
          <b-row align-v="center" class="mb-2">
            <b-col>
              <i :class="`fas fa-${quiz.icon} icon`"></i>
              <p class="font-weight-bold p-0 m-0">
                {{ getGroupTitle(quiz, index) }}
              </p>
            </b-col>
          </b-row>
          <b-form-group label="Quiz Title">
            <b-form-input v-model="quiz.title" />
          </b-form-group>
          <b-form-group label="Quiz Type">
            <b-form-select v-model="quiz.type" :options="typeOptions" />
          </b-form-group>
          <b-form-group label="Content ID">
            <b-form-input v-model="quiz.contentId" />
          </b-form-group>
          <b-form-group label="Quiz Icon">
            <b-form-select v-model="quiz.icon" :options="icons" />
          </b-form-group>
        </b-form-group>
      </b-card>
    </div>
    <b-button v-if="canAddQuiz" variant="primary">
      <i class="fas fa-plus icon"></i>
      Add Quiz
    </b-button>
  </b-tab>
</template>

<script>
export default {
  name: "quiz-modal",
  data() {
    return {
      canAddQuiz: false,
      quizzes: [
        {
          contentId: "",
          icon: "microphone",
          title: "",
          type: "H5P Audio Recorder",
        },
      ],
      typeOptions: ["H5P Audio Recorder"],
      icons: ["microphone"],
    }
  },
  methods: {
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

.quizzes {
  margin-bottom: 1em;
}
</style>
