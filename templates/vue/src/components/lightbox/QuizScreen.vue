<template>
  <div class="quiz-screen">
    <completion-screen v-if="showCompletionScreen">
      <button v-if="hasNext" class="button-completion" @click="next">
        <i class="fas fa-arrow-circle-right fa-4x"></i>
        <p>Next question</p>
      </button>
      <button v-else class="button-completion" @click="$emit('close')">
        <i class="far fa-times-circle fa-4x"></i>
        <p>Done</p>
      </button>
    </completion-screen>
    <question
      v-else
      :question="activeQuestion"
      :node="node"
      @submit="handleSubmit"
      @back="$emit('back')"
    ></question>
    <footer v-if="!showCompletionScreen" class="question-footer">
      <p class="question-step">{{ currentQuestionText }}</p>
      <button class="button-nav" :disabled="!hasPrev" @click="prev">
        <i class="fas fa-arrow-left"></i>
      </button>
      <button class="button-nav" :disabled="!hasNext" @click="next">
        <i class="fas fa-arrow-right"></i>
      </button>
    </footer>
  </div>
</template>

<script>
import Question from "./quiz-screen/Question"
import CompletionScreen from "./quiz-screen/CompletionScreen"
import { mapGetters } from "vuex"

export default {
  name: "quiz-screen",
  components: {
    CompletionScreen,
    Question,
  },
  props: {
    id: {
      type: [Number, String],
      required: true,
    },
  },
  data() {
    return {
      activeQuestionIndex: 0,
      showCompletionScreen: false,
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
    node() {
      return this.getNode(this.id)
    },
    quiz() {
      return this.node.quiz
    },
    activeQuestion() {
      return this.quiz[this.activeQuestionIndex]
    },
    currentQuestionText() {
      return `${this.activeQuestionIndex + 1}/${this.quiz.length}`
    },
    hasNext() {
      return this.activeQuestionIndex !== this.quiz.length - 1
    },
    hasPrev() {
      return this.activeQuestionIndex !== 0
    },
  },
  methods: {
    handleSubmit() {
      this.showCompletionScreen = true
      this.$emit("submit")
    },
    next() {
      this.showCompletionScreen = false
      this.activeQuestionIndex++
    },
    prev() {
      this.showCompletionScreen = false
      this.activeQuestionIndex--
    },
  },
}
</script>

<style lang="scss" scoped>
.quiz-screen {
  display: flex;
  background-size: cover;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #111;
  color: #eee;
  z-index: 10;
  padding: 24px;
}

.question-footer {
  margin-top: 1em;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.button-completion {
  background: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: inherit;
  margin-right: 3em;

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    color: #11a6d8;
  }

  p {
    margin: 1em auto 0;
    padding: 0;
    font-weight: 600;
  }
}

.button-nav {
  border-radius: 50%;
  height: 56px;
  width: 56px;
  background: #262626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: white;
  margin: 0;
  margin-right: 12px;
  opacity: 1;
  transition: all 0.1s ease-out;

  &:hover {
    background: #11a6d8;
  }

  &:disabled {
    opacity: 0.6;
    pointer-events: none;
    cursor: not-allowed;
  }

  &:last-child {
    margin-right: 0;
  }
}

.question-step {
  margin: 0;
  padding: 0;
  font-weight: bold;
  font-size: 40px;
  color: var(--tyde-blue);
  margin-right: 32px;
}
</style>
