<template>
  <quiz-screen
    :id="node.id"
    style="position: relative;"
    @submit="handleSubmit"
    @back="$emit('close')"
    @close="$emit('close')"
  />
</template>

<script>
import { mapActions } from "vuex"
import QuizScreen from "./QuizScreen"

export default {
  name: "quiz-media",
  components: {
    QuizScreen,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  methods: {
    ...mapActions(["updateNodeProgress"]),
    handleSubmit() {
      const numberCompleted = this.node.quiz.filter(question => question.completed)
        .length
      const progress = numberCompleted / this.node.quiz.length
      this.updateNodeProgress({ id: this.node.id, progress })
      if (progress === 1) {
        this.$emit("complete")
      }
    },
  },
}
</script>
