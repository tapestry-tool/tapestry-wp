<template>
  <b-form @submit="handleDragDropSubmit">
    <b-row align-h="between">
      <b-col cols="4">
        <b style="color: #009688">From buckets</b>
        <drag-drop-question-bucket
          v-for="bucket in fromBuckets"
          :key="bucket.id"
          :node="node"
          :question="question"
          :bucket="bucket"
        />
      </b-col>
      <b-col cols="4">
        <b style="color: #3f51b5">To buckets</b>
        <drag-drop-question-bucket
          v-for="bucket in toBuckets"
          :key="bucket.id"
          :node="node"
          :question="question"
          :bucket="bucket"
        />
      </b-col>
    </b-row>

    <b-form-invalid-feedback :state="isAnswerValid">
      Please complete this question to continue
    </b-form-invalid-feedback>
    <p>
      <b-button
        v-if="node.mediaType === 'activity'"
        class="submit-btn mt-3"
        variant="primary"
        type="submit"
      >
        Submit
      </b-button>
    </p>
  </b-form>
</template>

<script>
import DragDropQuestionBucket from "./DragDropQuestionBucket"
export default {
  components: {
    DragDropQuestionBucket,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    question: {
      type: Object,
      required: true,
    },
    answer: {
      type: [String, Object, Array],
      required: true,
    },
  },
  data() {},
  computed: {
    toBuckets() {
      return this.question.answerTypes.dragDrop.buckets.filter(
        bucket => bucket.type === "to"
      )
    },
    fromBuckets() {
      return this.question.answerTypes.dragDrop.buckets.filter(
        bucket => bucket.type === "from"
      )
    },
  },
  watch: {},
  created() {},
  methods: {
    handleDragDropSubmit(event) {
      event.preventDefault()
    },
  },
}
</script>
