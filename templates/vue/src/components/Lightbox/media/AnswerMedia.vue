<template>
  <div>
    <activity-screen
      :id="node.id"
      style="position: relative;"
      @submit="handleSubmit"
      @back="$emit('close')"
      @close="$emit('close')"
    />
    <h3 class="mb-4">{{ question.followUpText }}</h3>
    <tapestry-activity
      :key="answer.type"
      :type="answer.type"
      :entry="answer.entry"
    ></tapestry-activity>
    <div>
      <p>You haven't done the previous activity yet.</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import ActivityScreen from "./common/ActivityScreen"

export default {
  name: "answer-media",
  components: {
    ActivityScreen,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getNode", "getEntry", "getQuestion"]),
    quiz() {
      console.log(this.node.quiz)
      return this.node.quiz
    },
    question() {
      return this.node.quiz[0]
    },
    answer() {
      return this.question.answers
    },
  },
  mounted() {
    this.$emit("load")
  },
}
</script>

<style lang="scss" scoped>
.media-title {
  text-align: left;
  font-size: 1.75rem;
  font-weight: 500;
  margin-bottom: 0.9em;

  :before {
    display: none;
  }
}
</style>
