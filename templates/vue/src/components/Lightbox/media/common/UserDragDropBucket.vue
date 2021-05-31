<template>
  <div :class="bucketClass">
    <b style="font-size: 28px">{{ bucket.value }}</b>
    <b-form-group v-if="isFromBucket">
      <user-drag-drop-bucket-item
        v-for="item in bucket.itemArray"
        :key="item.id"
        :node="node"
        :bucketItem="item"
      />
    </b-form-group>
  </div>
</template>

<script>
import UserDragDropBucketItem from "./UserDragDropBucketItem"

export default {
  components: {
    UserDragDropBucketItem,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    isFromBucket: {
      type: Boolean,
      required: false,
    },
    bucket: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {}
  },
  computed: {
    bucketClass() {
      if (this.isFromBucket) {
        return "fromBucketContainer"
      } else {
        return "toBucketContainer"
      }
    },
  },
  methods: {},
}
</script>

<style scoped>
.fromBucketContainer {
  background-color: #009688;
  margin-bottom: 15px;
  padding-bottom: 80px;
}

.toBucketContainer {
  background-color: #3f51b5;
  margin-bottom: 15px;
  padding-bottom: 150px;
}
</style>
