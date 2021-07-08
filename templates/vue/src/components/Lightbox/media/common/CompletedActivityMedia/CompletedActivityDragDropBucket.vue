<template>
  <div class="from-bucket-container" :data-qa="`user-from-bucket-${bucket.id}`">
    <b class="bucket-label">{{ bucket.value }}</b>
    <completed-activity-drag-drop-bucket-item
      v-for="item in bucket.itemArray"
      :key="item.id"
      :bucketItem="item"
      :question="question"
      :data-qa="`user-bucket-item-${item.id}`"
    />
  </div>
</template>
<script>
import CompletedActivityDragDropBucketItem from "./CompletedActivityDragDropBucketItem"
export default {
  components: {
    CompletedActivityDragDropBucketItem,
  },
  props: {
    question: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    bucket: {
      type: Object,
      required: true,
    },
  },
}
</script>
<style scoped>
.from-bucket-container {
  background-color: #009688;
  margin-bottom: 15px;
  width: 80px;
  min-height: 80px;
  border-radius: 25px;
  overflow-wrap: break-word;
}
.bucket-label {
  font-size: 23px;
}
</style>
