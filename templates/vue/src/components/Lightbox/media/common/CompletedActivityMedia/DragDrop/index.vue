<template>
  <ul class="ml-1">
    <li v-for="bucket in buckets" :key="bucket.id" class="mr-2">
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
    dragDrop: {
      type: Object,
      required: true,
    },
  },
  computed: {
    buckets() {
      const toBuckets = this.dragDrop.buckets.filter(bucket => {
        const bucketHasItems = this.answerData.find(
          answerEntry => answerEntry.bucketId === bucket.id
        ).items.length
        return bucket.type === "to" && bucketHasItems
      })

      return toBuckets
    },
    hideText() {
      return !!this.dragDrop.hideText
    },
  },
  methods: {
    getItems(bucketId) {
      const answerItems = this.answerData.find(
        answerEntry => answerEntry.bucketId === bucketId
      ).items
      const items = this.dragDrop.items.filter(item => {
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
ul {
  display: flex;
  list-style-type: none;
}
</style>
