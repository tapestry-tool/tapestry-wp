<template>
  <b-form @submit="handleDragDropSubmit">
    <p>question data is {{ question }}</p>
    <b-row align-h="between">
      <b-col cols="4">
        <b style="color: #009688">From buckets</b>
        <user-drag-drop-bucket
          v-for="bucket in question.answerTypes.dragDrop.fromBucketArray"
          :key="bucket.id"
          :node="node"
          :question="question"
          :bucket="bucket"
          :fromBucketArray="question.answerTypes.dragDrop.fromBucketArray"
          :toBucketArray="question.answerTypes.dragDrop.toBucketArray"
          :isFromBucket="true"
        />
      </b-col>
      <b-col cols="4">
        <b style="color: #3f51b5">To buckets</b>
        <user-drag-drop-bucket
          v-for="bucket in question.answerTypes.dragDrop.toBucketArray"
          :key="bucket.id"
          :node="node"
          :question="question"
          :bucket="bucket"
          :fromBucketArray="question.answerTypes.dragDrop.fromBucketArray"
          :toBucketArray="question.answerTypes.dragDrop.toBucketArray"
          :isFromBucket="false"
        />
      </b-col>
    </b-row>

    <b-form-invalid-feedback :state="isAnswerValid">
      Please drag a item to a "to bucket"
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
import UserDragDropBucket from "./UserDragDropBucket"
export default {
  components: {
    UserDragDropBucket,
  },
  props: {
    question: {
      type: Object,
      required: true,
    },
    node: {
      type: Object,
      required: true,
    },
    answer: {
      type: [String, Object, Array],
      required: true,
    },
  },
  data() {
    return {
      isAnswerValid: true,
      toBucketArray: this.question.answerTypes.dragDrop.toBucketArray,
      fromBucketArray: this.question.answerTypes.dragDrop.fromBucketArray,
      dragDropAnswer: {},
    }
  },
  computed: {
    toBucketValidAnswerState() {
      for (let i = 0; i < this.toBucketArray.length; i++) {
        if (this.toBucketArray[i].itemArray.length > 0) {
          return true
        }
      }
      return false
    },
  },
  watch: {
    toBucketArray(newToBucketArray) {
      this.toBucketArray = newToBucketArray
      this.question.answerTypes.dragDrop.toBucketArray = this.toBucketArray
    },
    fromBucketArray(newFromBucketArray) {
      this.fromBucketArray = newFromBucketArray
      this.question.answerTypes.dragDrop.fromBucketArray = this.fromBucketArray
    },
  },
  created() {
    console.log(
      "11 this.question from bucket is",
      this.question.answerTypes.dragDrop.fromBucketArray
    )
    if (this.answer !== "") {
      this.dragDropAnswer = this.answer
      this.initialize()
    }
  },
  methods: {
    initialize() {
      // update all imageurls and text fields here
      console.log("this.answer is", this.answer)
      console.log(
        "this.question from bucket is",
        this.question.answerTypes.dragDrop.fromBucketArray
      )
      for (const toBucket of this.answer.toBucketArray) {
        for (
          let i = 0;
          i < this.question.answerTypes.dragDrop.toBucketArray.length;
          i++
        ) {
          if (
            this.question.answerTypes.dragDrop.toBucketArray[i].id === toBucket.id
          ) {
            // update all imageurls and text fields here
            // update all imageurls and text fields here
            for (let j = 0; j < toBucket.itemArray.length; j++) {
              for (
                let k = 0;
                k <
                this.question.answerTypes.dragDrop.toBucketArray[i].itemArray.length;
                k++
              ) {
                if (
                  toBucket.itemArray[j].id ===
                  this.question.answerTypes.dragDrop.toBucketArray[i].itemArray[k].id
                ) {
                  toBucket.itemArray[
                    j
                  ].color = this.question.answerTypes.dragDrop.toBucketArray[
                    i
                  ].itemArray[k].color
                  toBucket.itemArray[
                    j
                  ].imageurl = this.question.answerTypes.dragDrop.toBucketArray[
                    i
                  ].itemArray[k].imageurl
                  toBucket.itemArray[
                    j
                  ].text = this.question.answerTypes.dragDrop.toBucketArray[
                    i
                  ].itemArray[k].text
                }
              }
            }
            this.question.answerTypes.dragDrop.toBucketArray[i].itemArray =
              toBucket.itemArray
          }
        }
      }

      for (const fromBucket of this.answer.fromBucketArray) {
        for (
          let i = 0;
          i < this.question.answerTypes.dragDrop.fromBucketArray.length;
          i++
        ) {
          if (
            this.question.answerTypes.dragDrop.fromBucketArray[i].id ===
            fromBucket.id
          ) {
            // update all imageurls and text fields here
            for (let j = 0; j < fromBucket.itemArray.length; j++) {
              for (
                let k = 0;
                k <
                this.question.answerTypes.dragDrop.fromBucketArray[i].itemArray
                  .length;
                k++
              ) {
                if (
                  fromBucket.itemArray[j].id ===
                  this.question.answerTypes.dragDrop.fromBucketArray[i].itemArray[k]
                    .id
                ) {
                  fromBucket.itemArray[
                    j
                  ].color = this.question.answerTypes.dragDrop.fromBucketArray[
                    i
                  ].itemArray[k].color
                  fromBucket.itemArray[
                    j
                  ].imageurl = this.question.answerTypes.dragDrop.fromBucketArray[
                    i
                  ].itemArray[k].imageurl
                  fromBucket.itemArray[
                    j
                  ].text = this.question.answerTypes.dragDrop.fromBucketArray[
                    i
                  ].itemArray[k].text
                }
              }
            }
            this.question.answerTypes.dragDrop.fromBucketArray[i].itemArray =
              fromBucket.itemArray
          }
        }
      }
    },
    updateDragDropAnswer() {
      this.dragDropAnswer.fromBucketArray = this.question.answerTypes.dragDrop.fromBucketArray
      this.dragDropAnswer.toBucketArray = this.question.answerTypes.dragDrop.toBucketArray
    },
    handleDragDropSubmit(event) {
      event.preventDefault()
      this.isAnswerValid = this.toBucketValidAnswerState
      if (this.isAnswerValid) {
        this.updateDragDropAnswer()
        this.$emit("submit", this.dragDropAnswer)
      }
    },
  },
}
</script>
