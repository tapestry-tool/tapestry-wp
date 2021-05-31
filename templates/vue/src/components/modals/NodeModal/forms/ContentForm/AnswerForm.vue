<template>
  <div>
    <b-form-group data-qa="question-combobox" label="Select a question:">
      <combobox
        v-model="questionId"
        :options="questionOptions"
        data-qa="choose-question-node"
        item-text="text"
        item-value="id"
        empty-message="There are no questions yet."
      >
        <template v-slot="slotProps">
          <p>
            {{ slotProps.option.text }}
          </p>
        </template>
      </combobox>
    </b-form-group>
    <b-form-group
      label="Show this text first: "
      description="If empty, will default to the follow-up text of the question form."
    >
      <b-form-input v-model="followUpText" data-qa="follow-up-text"></b-form-input>
    </b-form-group>
  </div>
</template>

<script>
import { mapState } from "vuex"
import Combobox from "@/components/modals/common/Combobox"
export default {
  components: {
    Combobox,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      questionId: "",
      followUpText: "",
    }
  },
  computed: {
    ...mapState(["nodes"]),
    questionOptions() {
      let questions = Object.values(this.nodes)
        .filter(node => Boolean(node.quiz))
        .flatMap(node => node.quiz)
      return questions
    },
  },
  watch: {
    followUpText(text) {
      this.followUpText = text
    },
  },
  mounted() {
    this.questionId = this.initQuestionId()
    this.followUpText = this.initFollowUpText()
  },
  updated() {
    const answerObject = {
      questionId: this.questionId,
      followUpText: this.followUpText,
    }
    this.node.answer = answerObject
  },
  methods: {
    initQuestionId() {
      if (this.node.hasOwnProperty("answer")) {
        return this.node.answer.questionId
      }
      return ""
    },
    initFollowUpText() {
      if (this.node.hasOwnProperty("answer")) {
        return this.node.answer.followUpText
      }
      return ""
    },
  },
}
</script>

<style scoped></style>
