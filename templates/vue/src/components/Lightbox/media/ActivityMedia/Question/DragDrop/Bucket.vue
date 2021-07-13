<template>
  <div>
    <div
      :class="bucketClass"
      :data-qa="bucketTestId"
      @dragover.prevent
      @dragenter.prevent
      @drop.prevent="drop($event, bucket)"
    >
      <b class="bucket-label">{{ bucket.value }}</b>
      <item
        v-for="item in items"
        :key="item"
        :node="node"
        :question="question"
        :item="item"
        :data-qa="`user-bucket-item-${item}`"
      />
    </div>
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
    question: {
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
        ? "from-bucket-container"
        : "to-bucket-container"
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

<style scoped>
.from-bucket-container {
  background-color: #009688;
  margin-bottom: 15px;
  min-height: 350px;
  padding-bottom: 100px;
  border-radius: 25px;
  overflow-wrap: break-word;
}
.to-bucket-container {
  background-color: #3f51b5;
  margin-bottom: 15px;
  min-height: 250px;
  padding-bottom: 100px;
  border-radius: 25px;
  overflow-wrap: break-word;
}
.bucket-label {
  font-size: 28px;
}
</style>
