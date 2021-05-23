<template>
  <b-form @submit="handleTextSubmit">
      <b-form-group v-if="node.typeData.options.multipleChoice.multiAnswer">
        <b-form-checkbox-group v-model="userSelected">
    <p>
        checkbox list here user form
    </p>
        </b-form-checkbox-group>
      </b-form-group>
      <b-form-group v-else-if="!node.typeData.options.multipleChoice.multiAnswer">
        <b-form-checkbox-group v-model="userSelected">
    <p>
        radio list here user form
    </p>
        </b-form-checkbox-group>
      </b-form-group>
    <b-form-invalid-feedback :state="isAnswerValid">
      Please enter a response.
    </b-form-invalid-feedback>

    <b-button
      v-if="node.mediaType === 'question'"
      class="submit-btn mt-3"
      variant="primary"
      type="submit"
    >
      Submit
    </b-button>
  </b-form>
</template>

<script>
export default {
  name: "text-form",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      userSelected: [],
      textAnswer: "",
      isAnswerValid: true,
    }
  },
  computed: {
    question() {
      return this.node.quiz[0]
    },
    textId() {
      return this.question.answers.textId
    },
  },
  mounted() {
    this.textAnswer = this.question.entries.textId
      ? this.question.entries.textId[this.textId]
      : ""
  },
  methods: {
    handleTextSubmit(event) {
      event.preventDefault()
      this.isAnswerValid = this.textAnswer !== ""
      if (this.isAnswerValid) {
        this.$emit("submit", this.textAnswer)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.submit-btn {
  float: right;
}
</style>