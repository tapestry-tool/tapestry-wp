<template>
  <div class="from-bucket-container" :data-qa="`user-from-bucket-${bucket.id}`">
    <b style="font-size: 1rem">{{ bucket.text }}</b>
    <item
      v-for="item in items"
      :key="item.id"
      :item="item"
      :hide-text="hideText"
      class="user-item"
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
  background-color: #3f51b5;
  padding: 5px 0;
  width: 80px;
  min-height: 80px;
  border-radius: 5px;
  overflow-wrap: break-word;
}
</style>
