<template>
  <div>
    <div v-show="quizOpened" ref="quiz-container"></div>
    <div v-show="!quizOpened">
      <h1>{{ question.text }}</h1>
      <p>I would like to answer with:</p>
      <div>
        <button @click="openForm(question.answers.textId)">Text</button>
        <button>Audio</button>
        <button @click="openForm(question.answers.checklistId)">Checklist</button>
      </div>
      <footer>
        <button @click="$emit('next')">Next</button>
      </footer>
    </div>
  </div>
</template>

<script>
import TapestryAPI from "@/services/TapestryAPI"

export default {
  name: 'question',
  data() {
    return {
      quizOpened: false
    }
  },
  props: {
    question: {
      type: Object,
      required: true
    }
  },
  methods: {
    async openForm(id) {
      if (!id) {
        return;
      }
      const TapestryApi = new TapestryAPI(wpPostId)
      try {
        const response = await TapestryApi.getGravityForm(id)
        if (response) {
          const gravityForm = document.createElement('div')
          gravityForm.innerHTML = response.data

          this.$refs['quiz-container'].appendChild(gravityForm)
          this.quizOpened = true
        }
      } catch (e) {
        console.error(e)
      }
    },
  }
}
</script>

<style scoped>
button {
  min-width: 100px;
  margin-top: 50px;
}
</style>
