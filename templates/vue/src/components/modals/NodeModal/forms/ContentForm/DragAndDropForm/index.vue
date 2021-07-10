<template>
  <div>
    <b-form-group>
      <b>From buckets</b>
      <b-form-checkbox v-model="useImages" data-qa="dragdrop-useImages">
        Use Images
      </b-form-checkbox>
      <b-form-checkbox
        v-if="useImages"
        v-model="hideText"
        data-qa="dragdrop-useImages"
      >
        Hide Text
      </b-form-checkbox>
      <drag-drop-bucket
        v-for="bucket in fromBuckets"
        :key="bucket.id"
        :bucket="bucket"
        :items="getBucketsItems(bucket.id)"
        :bucketRemovalAllowed="fromBuckets.length > 1"
        :useImages="useImages"
        :data-qa="`from-bucket-${bucket.id}`"
        @remove="fromBuckets.splice(bucketIndex, 1)"
        @add="addItem(bucket.id)"
      />
      <b-button
        class="add-btn"
        variant="primary"
        squared
        data-qa="add-from-bucket-button"
        @click="addBucket('from')"
      >
        Add bucket
      </b-button>
    </b-form-group>
    <b-form-group>
      <b>To buckets</b>
      <drag-drop-bucket
        v-for="bucket in toBuckets"
        :key="bucket.id"
        :bucket="bucket"
        :bucketRemovalAllowed="toBuckets.length > 1"
        :items="getBucketsItems(bucket.id)"
        :useImages="useImages"
        :data-qa="`to-bucket-${bucket.id}`"
        @remove="toBuckets.splice(index, 1)"
      />
      <b-button
        class="add-btn"
        variant="primary"
        squared
        data-qa="add-to-bucket-button"
        @click="addBucket('to')"
      >
        Add bucket
      </b-button>
    </b-form-group>
  </div>
</template>

<script>
import DragDropBucket from "./DragDropBucket"
import Helpers from "@/utils/Helpers"
export default {
  components: {
    DragDropBucket,
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
  },
  data() {
    return {
      enabled: true,
      useImages: false,
      hideText: false,
      buckets: [
        {
          id: Helpers.createUUID(),
          type: "from",
          text: "",
        },
        {
          id: Helpers.createUUID(),
          type: "to",
          text: "",
        },
      ],
    }
  },
  computed: {
    items() {
      return [
        {
          color: "#808080",
          text: "",
          imageUrl: "",
          bucketId: this.buckets[0].id,
        },
      ]
    },
    fromBuckets() {
      return this.buckets.filter(bucket => bucket.type === "from")
    },
    toBuckets() {
      return this.buckets.filter(bucket => bucket.type === "to")
    },
  },
  created() {
    if (
      !this.question.answerTypes.dragDrop.hasOwnProperty("fromBucketArray") ||
      !this.question.answerTypes.dragDrop.hasOwnProperty("toBucketArray")
    ) {
      this.question.answerTypes.dragDrop.fromBucketArray = this.fromBuckets
      this.question.answerTypes.dragDrop.toBucketArray = this.toBuckets
      this.question.answerTypes.dragDrop.nextFromBucketItemId = this.nextFromBucketItemId
      this.question.answerTypes.dragDrop.nextFromBucketId = this.nextFromBucketId
      this.question.answerTypes.dragDrop.nextToBucketId = this.nextToBucketId
      this.question.answerTypes.dragDrop.useImages = this.useImages
      this.question.answerTypes.dragDrop.hideText = this.hideText
    } else {
      this.fromBuckets = this.question.answerTypes.dragDrop.fromBucketArray
      this.toBuckets = this.question.answerTypes.dragDrop.toBucketArray
      this.nextFromBucketItemId = this.question.answerTypes.dragDrop.nextFromBucketItemId
      this.nextFromBucketId = this.question.answerTypes.dragDrop.nextFromBucketId
      this.nextToBucketId = this.question.answerTypes.dragDrop.nextToBucketId
      this.useImages = this.question.answerTypes.dragDrop.useImages
      this.hideText = this.question.answerTypes.dragDrop.hideText
    }
  },
  methods: {
    addBucket(type) {
      this.buckets.push({
        id: Helpers.createUUID(),
        type: type,
        text: "",
      })
    },
    addItem(bucketId) {
      this.items.push({
        color: "#808080",
        text: "",
        imageUrl: "",
        bucketId: bucketId,
      })

      /* NOTE: we have to force update because we relay on
               relay on computed properties that do not 
               cause the components to re-render upon change
       */

      this.$forceUpdate()
      console.log(this.items)
    },
    getBucketsItems(bucketId) {
      return this.items.filter(item => item.bucketId === bucketId)
    },
  },
}
</script>

<style scoped>
.add-btn {
  margin-top: 20px;
}
</style>
