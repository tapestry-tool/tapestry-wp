<template>
  <b-form @submit="handleDragDropSubmit">
    <p>toBucketAnswer is {{ toBucketAnswer }}</p>
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
  },
  data() {
    return {
      isAnswerValid: true,
      toBucketArray: this.question.answerTypes.dragDrop.toBucketArray,
      fromBucketArray: this.question.answerTypes.dragDrop.fromBucketArray,
      toBucketAnswer: "",
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
  created() {},
  methods: {
    updateToBucketAnswer() {
      for (let i = 0; i < this.toBucketArray.length; i++) {
        if (this.toBucketArray[i].itemArray.length > 0) {
          let bucketValue = this.toBucketArray[i].value
          let itemValueArray = this.getItemArray(this.toBucketArray[i])
          this.toBucketAnswer = this.toBucketAnswer + String(bucketValue) + ": "
          let itemValueArrayString = String(itemValueArray)
          if (this.determineToFromBucketAnswerQuantity()) {
            this.toBucketAnswer = this.toBucketAnswer + itemValueArrayString
          } else {
            this.toBucketAnswer = this.toBucketAnswer + itemValueArrayString + "\n"
          }
        }
      }
    },
    getItemArray(bucket) {
      var itemArray = []
      for (let i = 0; i < bucket.itemArray.length; i++) {
        itemArray.push(bucket.itemArray[i].text)
      }
      return itemArray
    },
    determineToFromBucketAnswerQuantity() {
      var num = 0
      for (let i = 0; i < this.toBucketArray.length; i++) {
        if (this.toBucketArray[i].itemArray.length > 0) {
          num++
        }
      }
      return Boolean(num === 1)
    },
    handleDragDropSubmit(event) {
      event.preventDefault()
      this.isAnswerValid = this.toBucketValidAnswerState
      this.updateToBucketAnswer()
      console.log("submitted result", this.toBucketAnswer)
      if (this.isAnswerValid) {
        this.$emit("submit", this.toBucketAnswer)
      }
    },
  },
}
</script>
