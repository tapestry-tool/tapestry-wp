<template>
  <div>
    <div
      v-if="isFromBucket"
      class="fromBucketContainer"
      :data-qa="`user-from-bucket-${bucket.id}`"
      @dragover.prevent
      @dragenter.prevent
      @drop.prevent="drop($event, bucket)"
    >
      <b class="bucketLabel">{{ bucket.value }}</b>
      <user-drag-drop-bucket-item
        v-for="item in bucket.itemArray"
        :key="item.id"
        :node="node"
        :question="question"
        :bucketItem="item"
        :parentBucket="bucket"
        :isFromBucketItem="true"
        :data-qa="`user-bucket-item-${item.id}`"
      />
    </div>
    <div
      v-else
      class="toBucketContainer"
      :data-qa="`user-to-bucket-${bucket.id}`"
      @dragover.prevent
      @dragenter.prevent
      @drop.prevent="drop($event, bucket)"
    >
      <b class="bucketLabel">{{ bucket.value }}</b>
      <user-drag-drop-bucket-item
        v-for="item in bucket.itemArray"
        :key="item.id"
        :node="node"
        :question="question"
        :bucketItem="item"
        :parentBucket="bucket"
        :isFromBucketItem="false"
        :data-qa="`user-bucket-item-${item.id}`"
      />
    </div>
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
      required: true,
    },
    fromBucketArray: {
      type: Array,
      required: true,
    },
    toBucketArray: {
      type: Array,
      required: true,
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
  created() {
    if (
      !this.node.typeData.options.dragDrop.hasOwnProperty("fromBucketArray") ||
      !this.node.typeData.options.dragDrop.hasOwnProperty("toBucketArray")
    ) {
      this.node.typeData.options.dragDrop.fromBucketArray = this.fromBucketArray
      this.node.typeData.options.dragDrop.toBucketArray = this.toBucketArray
    } else {
      this.fromBucketArray = this.node.typeData.options.dragDrop.fromBucketArray
      this.toBucketArray = this.node.typeData.options.dragDrop.toBucketArray
    }
  },
  methods: {
    drop: function(e, bucket) {
      const itemId = e.dataTransfer.getData("itemId")
      const parentBucketId = e.dataTransfer.getData("parentBucketId")
      const booleanValue = e.dataTransfer.getData("isFromBucketItem")
      const isFromBucket = booleanValue === "true"
      if (isFromBucket) {
        let parentBucket = this.findBucketInFromBucketArray(parentBucketId)
        console.log("parent bucket is", parentBucket)
        let item = this.findItemInParentBucketArray(parentBucket, itemId)
        console.log("about to be added item is", item)
        bucket.itemArray.push(item)
      } else {
        console.log("move items within to buckets")
        let parentBucket = this.findBucketInToBucketArray(parentBucketId)
        console.log("parent to bucket is", parentBucket)
        let item = this.findItemInParentBucketArray(parentBucket, itemId)
        console.log("about to be added item is", item)
        bucket.itemArray.push(item)
      }
    },
    findBucketInFromBucketArray: function(parentBucketId) {
      console.log("passed in parent bucket id is", parentBucketId)
      let foundBucket = ""
      for (let i = 0; i < this.fromBucketArray.length; i++) {
        console.log("current from bucket is", this.fromBucketArray[i])
        console.log("current from bucket id is", this.fromBucketArray[i].id)
        if (this.fromBucketArray[i].id === Number(parentBucketId)) {
          console.log("got here")
          foundBucket = this.fromBucketArray[i]
        }
      }
      return foundBucket
    },
    findItemInParentBucketArray: function(parentBucket, itemId) {
      console.log("passed in parent bucket id is", parentBucket)
      let foundItem = ""
      for (let i = 0; i < parentBucket.itemArray.length; i++) {
        console.log("current parent bucket item is", parentBucket.itemArray[i])
        console.log("current parent bucket item id is", parentBucket.itemArray[i].id)
        if (parentBucket.itemArray[i].id === Number(itemId)) {
          console.log("got here")
          foundItem = parentBucket.itemArray[i]
          parentBucket.itemArray.splice(i, 1)
        }
      }
      return foundItem
    },
    findBucketInToBucketArray: function(parentBucketId) {
      console.log("passed in parent bucket id is", parentBucketId)
      let foundBucket = ""
      for (let i = 0; i < this.toBucketArray.length; i++) {
        console.log("current to bucket is", this.toBucketArray[i])
        console.log("current to bucket id is", this.toBucketArray[i].id)
        if (this.toBucketArray[i].id === Number(parentBucketId)) {
          console.log("got here")
          foundBucket = this.toBucketArray[i]
        }
      }
      return foundBucket
    },
  },
}
</script>

<style scoped>
.fromBucketContainer {
  background-color: #009688;
  margin-bottom: 15px;
  min-height: 350px;
  padding-bottom: 100px;
  border-radius: 25px;
  overflow-wrap: break-word;
}
.toBucketContainer {
  background-color: #3f51b5;
  margin-bottom: 15px;
  min-height: 350px;
  padding-bottom: 100px;
  border-radius: 25px;
  overflow-wrap: break-word;
}
.bucketLabel {
  font-size: 28px;
}
</style>
