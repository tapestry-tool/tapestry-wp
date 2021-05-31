<template>
  <div>
    <p>currently data is {{ node.typeData.options.dragDrop }}</p>
    <b-form-group>
      From Buckets
      <drag-drop-bucket
        v-for="(bucket, bucketIndex) in fromBuckets"
        :key="bucket.id"
        :node="node"
        :index="bucketIndex"
        :bucket="bucket"
        :isFromBucket="true"
        :removeFromDisabled="removeButtonFromDisabled"
        @remove="fromBuckets.splice(bucketIndex, 1)"
        @add="addNewFromBucketItem(bucketIndex)"
      />
      <b-button
        class="addButton"
        variant="primary"
        squared
        @click="addNewFromBucket"
      >
        Add a bucket
      </b-button>
    </b-form-group>
    <b-form-group>
      To Buckets
      <drag-drop-bucket
        v-for="(bucket, index) in toBuckets"
        :key="bucket.id"
        :node="node"
        :index="index"
        :bucket="bucket"
        :isFromBucket="false"
        :removeToDisabled="removeButtonToDisabled"
        @remove="toBuckets.splice(index, 1)"
      />
      <b-button class="addButton" variant="primary" squared @click="addNewToBucket">
        Add a bucket
      </b-button>
    </b-form-group>
  </div>
</template>

<script>
import DragDropBucket from "./DragDropBucket"

export default {
  components: {
    DragDropBucket,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      fromBuckets: [
        {
          id: 1,
          value: "",
          itemArray: [
            {
              id: 1,
              color: "#808080",
              imageurl: "",
              text: "",
              useImage: false,
              useText: false,
            },
          ],
        },
      ],
      nextFromBucketItemId: 2,
      nextFromBucketId: 2,
      nextFromBucketValue: "",
      toBuckets: [
        {
          id: 200,
          value: "",
        },
      ],
      nextToBucketId: 201,
      nextToBucketValue: "",
    }
  },
  computed: {
    removeButtonFromDisabled() {
      return this.fromBuckets.length === 1
    },
    removeButtonToDisabled() {
      return this.toBuckets.length === 1
    },
  },
  watch: {
    fromBuckets(newFromBuckets) {
      this.node.typeData.options.dragDrop.fromBucketArray = newFromBuckets
    },
    toBuckets(newToBuckets) {
      this.node.typeData.options.dragDrop.toBucketArray = newToBuckets
    },
  },
  created() {
    if (
      !this.node.typeData.options.dragDrop.hasOwnProperty("fromBucketArray") &&
      !this.node.typeData.options.dragDrop.hasOwnProperty("toBucketArray")
    ) {
      this.node.typeData.options.dragDrop.fromBucketArray = this.fromBuckets
      this.node.typeData.options.dragDrop.toBucketArray = this.toBuckets
    } else {
      this.fromBuckets = this.node.typeData.options.dragDrop.fromBucketArray
      this.toBuckets = this.node.typeData.options.dragDrop.toBucketArray
    }
  },
  methods: {
    addNewFromBucket: function() {
      this.fromBuckets.push({
        id: this.nextFromBucketId++,
        value: this.nextFromBucketValue,
        itemArray: [],
      })
      this.nextFromBucketValue = ""
    },
    addNewFromBucketItem: function(bucketIndex) {
      this.fromBuckets[bucketIndex].itemArray.push({
        id: this.nextFromBucketItemId++,
        color: "#808080",
        imageurl: "",
        text: "",
        useImage: false,
        useText: false,
      })
    },
    addNewToBucket: function() {
      this.toBuckets.push({
        id: this.nextToBucketId++,
        value: this.nextToBucketValue,
      })
      this.nextToBucketValue = ""
    },
  },
}
</script>

<style scoped>
.addButton {
  margin-top: 20px;
}
</style>
