<template>
  <b-form @submit="handleDragDropSubmit">
    <!-- <p>Current data is {{ node.typeData.options.dragDrop }}</p> -->
    <b-row align-h="between">
      <b-col cols="3">
        <b style="color: #009688">From buckets</b>
        <user-drag-drop-bucket
          v-for="bucket in node.typeData.options.dragDrop.fromBucketArray"
          :key="bucket.id"
          :node="node"
          :bucket="bucket"
          :fromBucketArray="node.typeData.options.dragDrop.fromBucketArray"
          :toBucketArray="node.typeData.options.dragDrop.toBucketArray"
          :isFromBucket="true"
        />
      </b-col>
      <b-col cols="3">
        <b style="color: #3f51b5">To buckets</b>
        <user-drag-drop-bucket
          v-for="bucket in node.typeData.options.dragDrop.toBucketArray"
          :key="bucket.id"
          :node="node"
          :bucket="bucket"
          :fromBucketArray="node.typeData.options.dragDrop.fromBucketArray"
          :toBucketArray="node.typeData.options.dragDrop.toBucketArray"
          :isFromBucket="false"
        />
      </b-col>
    </b-row>

    <b-form-invalid-feedback :state="toBucketValidAnswerState">
      Please drag a item to a "to bucket"
    </b-form-invalid-feedback>
    <!-- <p>to bucket array is currently {{ toBucketArray }}</p>
    <p>to bucket answer is currently {{ toBucketAnswer }}</p> -->
    <p>
      <b-button
        v-if="node.mediaType === 'question'"
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
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isAnswerValid: true,
      toBucketArray: this.node.typeData.options.dragDrop.toBucketArray,
      fromBucketArray: this.node.typeData.options.dragDrop.fromBucketArray,
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
      this.node.typeData.options.dragDrop.toBucketArray = this.toBucketArray
    },
    fromBucketArray(newFromBucketArray) {
      this.fromBucketArray = newFromBucketArray
      this.node.typeData.options.dragDrop.fromBucketArray = this.fromBucketArray
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
      if (this.toBucketValidAnswerState) {
        this.isAnswerValid = true
      } else {
        this.isAnswerValid = false
      }
      this.updateToBucketAnswer()
      console.log("submitted result", this.toBucketAnswer)

      if (this.isAnswerValid) {
        this.$emit("submit", this.toBucketAnswer)
      }
    },
  },
}
</script>

<style scoped></style>
