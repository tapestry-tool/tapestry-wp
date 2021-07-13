<template>
  <b-form @submit="handleDragDropSubmit">
    <b-row align-h="between">
      <b-col cols="4">
        <b style="color: #009688">From buckets</b>
        <bucket
          v-for="bucket in getBuckets('from')"
          :key="bucket.id"
          :node="node"
          :question="question"
          :bucket="bucket"
          :items="getBucketsItems(bucket.id)"
          @item-drop="handleDrop"
        />
      </b-col>
      <b-col cols="4">
        <b style="color: #3f51b5">To buckets</b>
        <bucket
          v-for="bucket in getBuckets('to')"
          :key="bucket.id"
          :node="node"
          :question="question"
          :bucket="bucket"
          :items="getBucketsItems(bucket.id)"
          @item-drop="handleDrop"
        />
      </b-col>
    </b-row>

    <b-form-invalid-feedback :state="false">
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
import Bucket from "./Bucket"
export default {
  name: "drag-drop-question",
  components: {
    Bucket,
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
      type: [Array, String],
      required: true,
    },
  },
  created() {
    if (!this.answer) {
      this.answer = this.question.answerTypes.dragDrop.buckets.map(bucket => {
        const items = this.question.answerTypes.dragDrop.items
          .filter(item => {
            return item.bucketId === bucket.id
          })
          .map(item => item.id)
        return { bucketId: bucket.id, items: items }
      })
    }
  },
  methods: {
    getBuckets(type) {
      return this.question.answerTypes.dragDrop.buckets.filter(
        bucket => bucket.type === type
      )
    },
    getBucketsItems(bucketId) {
      return this.answer.find(item => {
        return item.bucketId === bucketId
      }).items
    },
    handleDragDropSubmit(event) {
      event.preventDefault()
    },
    handleDrop(event) {
      this.answer.forEach(answerEntry => {
        const itemIndex = answerEntry.items.indexOf(event.itemId)
        if (itemIndex !== -1) answerEntry.items.splice(itemIndex, 1)
      })
      this.answer
        .find(answerEntry => {
          return answerEntry.bucketId === event.bucketId
        })
        .items.push(event.itemId)
    },
  },
}
</script>
