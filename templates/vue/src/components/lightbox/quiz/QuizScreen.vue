<template>
  <div class="quiz-screen">
    <question :question="activeQuestion" @next="next"></question>
  </div>
</template>

<script>
import Question from "./Question"

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
      activeQuestionIndex: 0
    }
  },
  computed: {
    activeQuestion() {
      return this.quiz[this.activeQuestionIndex]
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
.quiz-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 1);
  color: black;
  z-index: 10;
}
</style>
