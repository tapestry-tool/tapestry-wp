<template>
  <div>
    <div
      :class="bucketClass"
      :data-qa="bucketTestId"
      @dragover.prevent
      @dragenter.prevent
      @drop.prevent="drop($event, bucket)"
    >
      <b class="bucket-label">{{ bucket.value }}</b>
      <drag-drop-question-bucket-item
        v-for="item in bucket.itemArray"
        :key="item.id"
        :node="node"
        :question="question"
        :bucketItem="item"
        :parentBucket="bucket"
        :isFromBucketItem="isFromBucket"
        :data-qa="`user-bucket-item-${item.id}`"
      />
    </div>
  </div>
</template>

<script>
import DragDropQuestionBucketItem from "./DragDropQuestionBucketItem"
export default {
  components: {
    DragDropQuestionBucketItem,
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
    isFromBucket: {
      type: Boolean,
      required: false,
    },
    bucket: {
      type: Object,
      required: true,
    },
  },
  computed: {
    bucketClass() {
      return this.isFromBucket ? "from-bucket-container" : "to-bucket-container"
    },
    bucketTestId() {
      return `user-${this.isFromBucket ? "from" : "to"}-bucket-${this.bucket.id}`
    },
    fromBucketArray() {
      return this.question.answerTypes.dragDrop.fromBucketArray
    },
    toBucketArray() {
      return this.question.answerTypes.dragDrop.toBucketArray
    },
  },
  created() {
    if (
      !this.question.answerTypes.dragDrop.hasOwnProperty("fromBucketArray") ||
      !this.question.answerTypes.dragDrop.hasOwnProperty("toBucketArray")
    ) {
      this.question.answerTypes.dragDrop.fromBucketArray = this.fromBucketArray
      this.question.answerTypes.dragDrop.toBucketArray = this.toBucketArray
    } else {
      this.fromBucketArray = this.question.answerTypes.dragDrop.fromBucketArray
      this.toBucketArray = this.question.answerTypes.dragDrop.toBucketArray
    }
  },
  methods: {
    drop: function(e, bucket) {
      const itemId = e.dataTransfer.getData("itemId")
      const parentBucketId = e.dataTransfer.getData("parentBucketId")
      const booleanValue = e.dataTransfer.getData("isFromBucketItem")
      const isFromBucket = booleanValue === "true"
      if (isFromBucket) {
        let parentBucket = this.findBucketInFromBucketArray(parentBucketId)
        let item = this.findItemInParentBucketArray(parentBucket, itemId)
        bucket.itemArray.push(item)
      } else {
        let parentBucket = this.findBucketInToBucketArray(parentBucketId)
        let item = this.findItemInParentBucketArray(parentBucket, itemId)
        bucket.itemArray.push(item)
      }
    },
    findBucketInFromBucketArray: function(parentBucketId) {
      return this.fromBucketArray.find(
        bucket => bucket.id === Number(parentBucketId)
      )
    },
    findItemInParentBucketArray: function(parentBucket, itemId) {
      let foundItem = ""
      for (let i = 0; i < parentBucket.itemArray.length; i++) {
        if (parentBucket.itemArray[i].id === Number(itemId)) {
          foundItem = parentBucket.itemArray[i]
          parentBucket.itemArray.splice(i, 1)
        }
      }
      return foundItem
    },
    findBucketInToBucketArray: function(parentBucketId) {
      return this.toBucketArray.find(bucket => bucket.id === Number(parentBucketId))
    },
  },
}
</script>

<style scoped>
.from-bucket-container {
  background-color: #009688;
  margin-bottom: 15px;
  min-height: 350px;
  padding-bottom: 100px;
  border-radius: 25px;
  overflow-wrap: break-word;
}
.to-bucket-container {
  background-color: #3f51b5;
  margin-bottom: 15px;
  min-height: 250px;
  padding-bottom: 100px;
  border-radius: 25px;
  overflow-wrap: break-word;
}
.bucket-label {
  font-size: 28px;
}
</style>
