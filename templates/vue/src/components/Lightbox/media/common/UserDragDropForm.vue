<template>
  <b-form>
    <p>Current data is {{ node.typeData.options.dragDrop }}</p>
    <b-row align-h="between">
      <b-col cols="5">
        <b style="color: #009688">From buckets</b>
        <user-drag-drop-bucket
          v-for="bucket in node.typeData.options.dragDrop.fromBucketArray"
          :key="bucket.id"
          :node="node"
          :bucket="bucket"
          :fromBucketArray="node.typeData.options.dragDrop.fromBucketArray"
          :toBucketArray="node.typeData.options.dragDrop.toBucketArray"
          :isFromBucket="true"
        />
      </b-col>
      <b-col cols="5">
        <b style="color: #3f51b5">To buckets</b>
        <user-drag-drop-bucket
          v-for="bucket in node.typeData.options.dragDrop.toBucketArray"
          :key="bucket.id"
          :node="node"
          :bucket="bucket"
          :fromBucketArray="node.typeData.options.dragDrop.fromBucketArray"
          :toBucketArray="node.typeData.options.dragDrop.toBucketArray"
          :isFromBucket="false"
        />
      </b-col>
    </b-row>

    <b-form-invalid-feedback :state="isAnswerValid">
      Please enter a response.
    </b-form-invalid-feedback>
    <p>to bucket array is currently {{ toBucketArray }}</p>
    <p>
      <b-button
        v-if="node.mediaType === 'question'"
        class="submit-btn mt-3"
        variant="primary"
        type="submit"
      >
        Submit
      </b-button>
    </p>
  </b-form>
</template>

<script>
import UserDragDropBucket from "./UserDragDropBucket"

export default {
  components: {
    UserDragDropBucket,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isAnswerValid: true,
      toBucketArray: this.node.typeData.options.dragDrop.toBucketArray,
      fromBucketArray: this.node.typeData.options.dragDrop.fromBucketArray,
    }
  },
  computed: {},
  watch: {
    toBucketArray(newToBucketArray) {
      this.toBucketArray = newToBucketArray
      this.node.typeData.options.dragDrop.toBucketArray = this.toBucketArray
    },
    fromBucketArray(newFromBucketArray) {
      this.fromBucketArray = newFromBucketArray
      this.node.typeData.options.dragDrop.fromBucketArray = this.fromBucketArray
    },
  },
  created() {},
  methods: {},
}
</script>

<style scoped></style>
