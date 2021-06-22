<template>
  <b-form @submit="handleDragDropSubmit">
    <p>dragDropAnswer is {{ dragDropAnswer }}</p>
    <p>toBucketArray is {{ toBucketArray }}</p>
    <p>fromBucketArray is {{ fromBucketArray }}</p>
    <b-row align-h="between">
      <b-col cols="3">
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
      <b-col cols="3">
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
      type: [String, Object],
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
    //console.log(this.answer)
    //console.log("type of this.answer is", typeof this.answer)
    if (this.answer !== "") {
      //console.log("initialize backend answer here")
      this.dragDropAnswer = this.answer
      this.initialize()
    }
  },
  methods: {
    initialize() {
      for (const key of Object.keys(this.answer)) {
        for (
          let i = 0;
          i < this.question.answerTypes.dragDrop.toBucketArray.length;
          i++
        ) {
          if (
            this.question.answerTypes.dragDrop.toBucketArray[i].id ===
            this.answer[key].bucketId
          ) {
            this.question.answerTypes.dragDrop.toBucketArray[
              i
            ].itemArray = this.answer[key].itemArray
          }
        }
      }

      for (
        let j = 0;
        j < this.question.answerTypes.dragDrop.fromBucketArray.length;
        j++
      ) {
        for (
          let k = 0;
          k < this.question.answerTypes.dragDrop.fromBucketArray[j].itemArray.length;
          k++
        ) {
          console.log(
            "got here",
            this.question.answerTypes.dragDrop.fromBucketArray[j].itemArray[k]
          )
          this.findIfExistInToBucket(
            this.question.answerTypes.dragDrop.fromBucketArray[j].itemArray[k]
          )
          // TODO FINISH HERE for cleaning up fromBucketArray
        }
      }
    },
    findIfExistInToBucket(item) {
      console.log("item is", item)
    },
    updateDragDropAnswer() {
      for (let i = 0; i < this.toBucketArray.length; i++) {
        if (this.toBucketArray[i].itemArray.length > 0) {
          let bucketValue = this.toBucketArray[i].value
          console.log("bucketValue is", bucketValue)
          console.log(this.toBucketArray[i].itemArray)
          this.dragDropAnswer[bucketValue] = {
            bucketId: this.toBucketArray[i].id,
            itemArray: this.toBucketArray[i].itemArray,
          }
        }
      }
    },
    handleDragDropSubmit(event) {
      event.preventDefault()
      this.isAnswerValid = this.toBucketValidAnswerState
      if (this.isAnswerValid) {
        this.updateDragDropAnswer()
        console.log("submitted result", this.dragDropAnswer)
        this.$emit("submit", this.dragDropAnswer)
      }
    },
  },
}
</script>
