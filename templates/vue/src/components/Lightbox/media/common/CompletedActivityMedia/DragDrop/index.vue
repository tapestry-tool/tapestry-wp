<template>
  <ul class="flexContainer">
    <li v-for="bucket in buckets" :key="bucket.id" class="flexItem">
      <bucket :bucket="bucket" :items="getItems(bucket.id)" :hide-text="hideText" />
    </li>
  </ul>
</template>

<script>
import Bucket from "./Bucket"

export default {
  name: "drag-drop",
  components: {
    Bucket,
  },
  props: {
    answerData: {
      type: Array,
      required: true,
    },
    question: {
      type: Object,
      required: true,
    },
  },
  computed: {
    buckets() {
      const toBuckets = this.question.answerTypes.dragDrop.buckets.filter(bucket => {
        const bucketHasItems = this.answerData.find(
          answerEntry => answerEntry.bucketId === bucket.id
        ).items.length
        return bucket.type === "to" && bucketHasItems
      })

      return toBuckets
    },
    hideText() {
      return !!this.question.answerTypes.dragDrop.hideText
    },
  },
  methods: {
    getItems(bucketId) {
      const answerItems = this.answerData.find(
        answerEntry => answerEntry.bucketId === bucketId
      ).items
      const items = this.question.answerTypes.dragDrop.items.filter(item => {
        return answerItems.some(answerItem => {
          return answerItem === item.id
        })
      })
      return items
    },
  },
}
</script>

<style lang="scss" scoped>
.flexContainer {
  display: flex;
  margin-left: 30px;
}
.flexItem {
  margin-right: 20px;
}
</style>
