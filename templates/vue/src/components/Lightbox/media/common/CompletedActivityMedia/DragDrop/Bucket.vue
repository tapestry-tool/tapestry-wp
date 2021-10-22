<template>
  <div class="bucket-container p-2 mx-2" :data-qa="`user-from-bucket-${bucket.id}`">
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

<style lang="scss" scoped>
.bucket-container {
  background-color: var(--bg-color-layered);
  color: var(--text-color-primary);
  display: inline-flex;
  flex-direction: column;
  border-radius: 15px;
  overflow-wrap: break-word;
}
</style>
