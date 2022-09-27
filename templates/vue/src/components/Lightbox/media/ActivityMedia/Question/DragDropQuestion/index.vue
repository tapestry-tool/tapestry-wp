<template>
  <b-form @submit="handleDragDropSubmit">
    <p>Drag items from the left to the right.</p>
    <h1 class="mb-3 mt-n3">&raquo;</h1>
    <b-row align-h="between">
      <b-col cols="6">
        <bucket
          v-for="bucket in getBuckets('from')"
          :key="bucket.id"
          class="user-from-bucket"
          :node="node"
          :drag-drop="dragDrop"
          :bucket="bucket"
          :items="getBucketsItems(bucket.id)"
          @item-drop="handleDrop"
        />
      </b-col>
      <b-col cols="6">
        <bucket
          v-for="bucket in getBuckets('to')"
          :key="bucket.id"
          class="user-to-bucket"
          :node="node"
          :drag-drop="dragDrop"
          :bucket="bucket"
          :items="getBucketsItems(bucket.id)"
          @item-drop="handleDrop"
        />
      </b-col>
    </b-row>
    <b-form-invalid-feedback :state="canSubmit">
      Please complete this question to continue
    </b-form-invalid-feedback>
    <div class="w-100 mt-4 text-right">
      <b-button
        v-if="question.optional"
        variant="link"
        @click="$emit('skip-question')"
      >
        Skip
      </b-button>
      <b-button v-if="canSubmit" variant="primary" type="submit">
        Submit
      </b-button>
    </div>
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
      required: true,
      validator: prop => Array.isArray(prop) || prop === null || prop === "",
    },
  },
  data() {
    return {
      answerData: null,
    }
  },
  computed: {
    dragDrop() {
      return this.question.answerTypes.dragDrop
    },
    canSubmit() {
      const toBuckets = this.getBuckets("to")
      return this.answerData.some(dataEntry => {
        return (
          toBuckets.some(bucket => bucket.id === dataEntry.bucketId) &&
          dataEntry.items.length >= 1
        )
      })
    },
  },
  created() {
    if (!this.answer) {
      this.answerData = this.dragDrop.buckets.map(bucket => {
        const items = this.dragDrop.items
          .filter(item => {
            return item.bucketId === bucket.id
          })
          .map(item => item.id)
        return { bucketId: bucket.id, items: items }
      })
    } else {
      this.answerData = this.answer
    }
  },
  methods: {
    getBuckets(type) {
      return this.dragDrop.buckets.filter(bucket => bucket.type === type)
    },
    getBucketsItems(bucketId) {
      return this.answerData.find(item => {
        return item.bucketId === bucketId
      }).items
    },
    handleDragDropSubmit(event) {
      event.preventDefault()
      this.$emit("submit", this.answerData)
    },
    handleDrop(event) {
      this.answerData.forEach(answerEntry => {
        const itemIndex = answerEntry.items.indexOf(event.itemId)
        if (itemIndex !== -1) answerEntry.items.splice(itemIndex, 1)
      })
      this.answerData
        .find(answerEntry => {
          return answerEntry.bucketId === event.bucketId
        })
        .items.push(event.itemId)
    },
  },
}
</script>
