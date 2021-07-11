<template>
  <div>
    <b-form-group>
      <b-form-checkbox
        v-model="question.answerTypes.dragDrop.useImages"
        data-qa="dragdrop-useImages"
      >
        Use Images
      </b-form-checkbox>
      <b-form-checkbox
        v-if="question.answerTypes.dragDrop.useImages"
        v-model="question.answerTypes.dragDrop.hideText"
        data-qa="dragdrop-useImages"
      >
        Hide Text
      </b-form-checkbox>
      <b>From buckets</b>
      <drag-drop-bucket
        v-for="bucket in fromBuckets"
        :key="bucket.id"
        :bucket="bucket"
        :items="getBucketsItems(bucket.id)"
        :bucketRemovalAllowed="fromBuckets.length > 1"
        :useImages="question.answerTypes.dragDrop.useImages"
        :data-qa="`from-bucket-${bucket.id}`"
        @remove-item="handleRemoveItem"
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
        :data-qa="`to-bucket-${bucket.id}`"
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
  computed: {
    fromBuckets() {
      return this.question.answerTypes.dragDrop.buckets.filter(
        bucket => bucket.type === "from"
      )
    },
    toBuckets() {
      return this.question.answerTypes.dragDrop.buckets.filter(
        bucket => bucket.type === "to"
      )
    },
  },
  created() {
    if (!this.question.answerTypes.dragDrop?.buckets) {
      this.question.answerTypes.dragDrop.buckets = [
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
      ]
    }

    if (!this.question.answerTypes.dragDrop?.items) {
      this.question.answerTypes.dragDrop.items = [
        {
          color: "#808080",
          text: "",
          imageUrl: "",
          bucketId: this.question.answerTypes.dragDrop.buckets[0].id,
        },
      ]
    }
  },
  methods: {
    addBucket(type) {
      this.question.answerTypes.dragDrop.buckets.push({
        id: Helpers.createUUID(),
        type: type,
        text: "",
      })
    },
    addItem(bucketId) {
      this.question.answerTypes.dragDrop.items.push({
        color: "#808080",
        text: "",
        imageUrl: "",
        bucketId: bucketId,
      })
    },
    handleRemoveItem($event) {
      this.question.answerTypes.dragDrop.items.splice($event, 1)
    },
    getBucketsItems(bucketId) {
      return this.question.answerTypes.dragDrop.items.filter(
        item => item.bucketId === bucketId
      )
    },
  },
}
</script>

<style scoped>
.add-btn {
  margin-top: 20px;
}
</style>
