<template>
  <div class="from-bucket-container" :data-qa="`user-from-bucket-${bucket.id}`">
    <b class="bucket-label">{{ bucket.text }}</b>
    <item
      v-for="item in items"
      :key="item.id"
      :item="item"
      :hideText="hideText"
      :data-qa="`user-bucket-item-${item.id}`"
    />
  </div>
</template>
<script>
import Item from "./Item"
export default {
  name: "bucket",
  components: {
    Item,
  },
  props: {
    hideText: {
      type: Boolean,
      required: true,
    },
    bucket: {
      type: Object,
      required: true,
    },
    items: {
      type: Array,
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
