<template>
  <div class="quiz-screen" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <question @form-opened="formOpened = true" :question="activeQuestion"></question>
    <footer>
      <button v-show="!formOpened" @click="next">Next</button>
    </footer>
  </div>
</template>

<script>
import Question from "./Question"
import BackgroundImg from "../../../assets/11-18-QuestionScreen.png";

export default {
  name: 'quiz-screen',
  components: {
    Question
  },
  props: {
    quiz: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      activeQuestionIndex: 0,
      formOpened: false
    }
  },
  computed: {
    activeQuestion() {
      return this.quiz[this.activeQuestionIndex]
    },
    backgroundImage() {
      return `${wpData.vue_uri}/${BackgroundImg.split("dist")[1]}`
    }
  },
  methods: {
    next() {
      this.activeQuestionIndex++
    }
  }
}
</script>

<style>
:root {
  --tyde-blue: #1074bb;
  --tyde-orange: #f79621;
  --tyde-orange-light: #f9b664;
}

.quiz-screen {
  display: flex;
  background-size: cover;
  flex-direction: column;
  padding: 24px;
  padding-left: 25%;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  color: black;
  z-index: 10;
}
</style>
