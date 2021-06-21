<template>
  <div>
    <b-form-group>
      <b>From buckets</b>
      <drag-drop-bucket
        v-for="(bucket, bucketIndex) in fromBuckets"
        :key="bucket.id"
        :node="node"
        :question="question"
        :index="bucketIndex"
        :bucket="bucket"
        :isFromBucket="true"
        :fromBucketArray="fromBuckets"
        :toBucketArray="toBuckets"
        :data-qa="`from-bucket-${bucket.id}`"
        @remove="fromBuckets.splice(bucketIndex, 1)"
        @add="addNewFromBucketItem(bucketIndex)"
      />
      <b-button
        class="addButton"
        variant="primary"
        squared
        data-qa="add-from-bucket-button"
        @click="addNewFromBucket"
      >
        Add a bucket
      </b-button>
    </b-form-group>
    <b-form-group>
      <b>To buckets</b>
      <drag-drop-bucket
        v-for="(bucket, index) in toBuckets"
        :key="bucket.id"
        :node="node"
        :question="question"
        :index="index"
        :bucket="bucket"
        :isFromBucket="false"
        :fromBucketArray="fromBuckets"
        :toBucketArray="toBuckets"
        :data-qa="`to-bucket-${bucket.id}`"
        @remove="toBuckets.splice(index, 1)"
      />
      <b-button
        class="addButton"
        variant="primary"
        squared
        data-qa="add-to-bucket-button"
        @click="addNewToBucket"
      >
        Add a bucket
      </b-button>
    </b-form-group>
  </div>
</template>

<script>
import DragDropBucket from "./DragDropBucket"
export default {
  components: {
    DragDropBucket,
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
  },
  data() {
    return {
      fromBuckets: [
        {
          id: 1,
          value: "",
          itemArray: [
            {
              id: 1,
              color: "#808080",
              imageurl: "",
              text: "",
              useImage: false,
              useText: false,
            },
          ],
        },
      ],
      nextFromBucketId: 2,
      nextFromBucketItemId: 2,
      nextFromBucketValue: "",
      toBuckets: [
        {
          id: 200,
          value: "",
          itemArray: [],
        },
      ],
      nextToBucketId: 201,
      nextToBucketValue: "",
    }
  },
  computed: {
    removeButtonFromDisabled() {
      return this.fromBuckets.length === 1
    },
    removeButtonToDisabled() {
      return this.toBuckets.length === 1
    },
  },
  watch: {
    fromBuckets(newFromBuckets) {
      this.question.answerTypes.dragDrop.fromBucketArray = newFromBuckets
    },
    toBuckets(newToBuckets) {
      this.question.answerTypes.dragDrop.toBucketArray = newToBuckets
    },
    nextFromBucketItemId(newNextFromBucketItemId) {
      this.question.answerTypes.dragDrop.nextFromBucketItemId = newNextFromBucketItemId
    },
    nextFromBucketId(newNextFromBucketId) {
      this.question.answerTypes.dragDrop.nextFromBucketId = newNextFromBucketId
    },
    nextToBucketId(newNextToBucketId) {
      this.question.answerTypes.dragDrop.nextToBucketId = newNextToBucketId
    },
  },
  created() {
    console.log(this.node.typeData)
    if (
      !this.question.answerTypes.dragDrop.hasOwnProperty("fromBucketArray") ||
      !this.question.answerTypes.dragDrop.hasOwnProperty("toBucketArray")
    ) {
      this.question.answerTypes.dragDrop.fromBucketArray = this.fromBuckets
      this.question.answerTypes.dragDrop.toBucketArray = this.toBuckets
      this.question.answerTypes.dragDrop.nextFromBucketItemId = this.nextFromBucketItemId
      this.question.answerTypes.dragDrop.nextFromBucketId = this.nextFromBucketId
      this.question.answerTypes.dragDrop.nextToBucketId = this.nextToBucketId
    } else {
      this.fromBuckets = this.question.answerTypes.dragDrop.fromBucketArray
      this.toBuckets = this.question.answerTypes.dragDrop.toBucketArray
      this.nextFromBucketItemId = this.question.answerTypes.dragDrop.nextFromBucketItemId
      this.nextFromBucketId = this.question.answerTypes.dragDrop.nextFromBucketId
      this.nextToBucketId = this.question.answerTypes.dragDrop.nextToBucketId
    }
  },
  methods: {
    addNewFromBucket: function() {
      this.fromBuckets.push({
        id: this.nextFromBucketId++,
        value: this.nextFromBucketValue,
        itemArray: [],
      })
      this.nextFromBucketValue = ""
    },
    addNewFromBucketItem: function(bucketIndex) {
      this.fromBuckets[bucketIndex].itemArray.push({
        id: this.nextFromBucketItemId++,
        color: "#808080",
        imageurl: "",
        text: "",
        useImage: false,
        useText: false,
      })
    },
    addNewToBucket: function() {
      this.toBuckets.push({
        id: this.nextToBucketId++,
        value: this.nextToBucketValue,
        itemArray: [],
      })
      this.nextToBucketValue = ""
    },
  },
}
</script>

<style scoped>
.addButton {
  margin-top: 20px;
}
</style>
