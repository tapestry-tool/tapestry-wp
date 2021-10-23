<template>
  <div
    :class="bucketClass"
    class="bucket-container pt-2 pb-4 mb-3"
    :data-qa="bucketTestId"
    @dragover.prevent
    @dragenter.prevent
    @drop.prevent="drop($event, bucket)"
  >
    <b class="bucket-label">{{ bucket.text }}</b>
    <item
      v-for="item in items"
      :key="item"
      :node="node"
      :drag-drop="dragDrop"
      :item="item"
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
    node: {
      type: Object,
      required: true,
    },
    dragDrop: {
      type: Object,
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
  computed: {
    bucketClass() {
      return this.bucket.type === "from"
        ? "bucket-container-from"
        : "bucket-container-to"
    },
    bucketTestId() {
      return `user-${this.bucket.type}-bucket-${this.bucket.id}`
    },
  },
  methods: {
    drop(e, bucket) {
      const itemId = e.dataTransfer.getData("itemId")
      this.$emit("item-drop", { bucketId: bucket.id, itemId: itemId })
    },
  },
}
</script>

<style lang="scss" scoped>
.bucket-container {
  display: flex;
  flex-direction: column;
  min-height: 250px;
  border-radius: 15px;
  overflow-wrap: break-word;

  &-from {
    color: var(--primary-color);
    background-color: var(--bg-color-layered);
  }
  &-to {
    color: var(--primary-color);
    background-color: var(--bg-color-layered);
  }

  .bucket-label {
    font-size: 28px;
  }
}
</style>
