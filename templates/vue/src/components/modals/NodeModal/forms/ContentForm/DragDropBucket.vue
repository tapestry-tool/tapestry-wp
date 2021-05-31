<template>
  <div class="container">
    <b-form-group :class="bucketClass">
      <b>New Bucket</b>
      <b-form-group v-if="isFromBucket">
        <drag-drop-bucket-item
          v-for="(item, index) in bucket.itemArray"
          :key="item.id"
          :node="node"
          :bucketItem="item"
          :removeItemDisabled="removeButtonItemDisabled"
          @remove="bucket.itemArray.splice(index, 1)"
        />
      </b-form-group>
      <b-button
        v-if="isFromBucket"
        class="addButton"
        variant="primary"
        squared
        @click="$emit('add')"
      >
        Add a item
      </b-button>
    </b-form-group>
    <b-form-group>
      <b-form-input
        v-if="isFromBucket"
        v-model="node.typeData.options.dragDrop.fromBucketArray[index].value"
        placeholder="Enter From Bucket Label"
      ></b-form-input>
      <b-form-input
        v-else
        v-model="node.typeData.options.dragDrop.toBucketArray[index].value"
        placeholder="Enter To Bucket Label"
      ></b-form-input>
      <b-button
        :disabled="isFromBucket ? removeFromDisabled : removeToDisabled"
        squared
        variant="outline-danger"
        @click="$emit('remove')"
      >
        Remove Bucket
      </b-button>
    </b-form-group>
  </div>
</template>

<script>
import DragDropBucketItem from "./DragDropBucketItem"

export default {
  components: {
    DragDropBucketItem,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    bucket: {
      type: Object,
      required: true,
    },
    isFromBucket: {
      type: Boolean,
      required: false,
    },
    removeFromDisabled: {
      type: Boolean,
      required: false,
    },
    removeToDisabled: {
      type: Boolean,
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
    removeButtonItemDisabled() {
      return this.bucket.itemArray.length === 1
    },
  },
  methods: {},
}
</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
}

.fromBucketContainer {
  background-color: #e0f2f1;
  margin-bottom: 15px;
}

.toBucketContainer {
  background-color: #e8eaf6;
  width: 80%;
  height: 100px;
  margin-bottom: 15px;
}
</style>
