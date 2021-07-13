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
      <bucket
        v-for="bucket in getBuckets('from')"
        :key="bucket.id"
        :bucket="bucket"
        :items="getBucketsItems(bucket.id)"
        :bucketRemovalAllowed="true"
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
      <bucket
        v-for="bucket in getBuckets('to')"
        :key="bucket.id"
        :bucket="bucket"
        :bucketRemovalAllowed="true"
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
import Bucket from "./Bucket"
import Helpers from "@/utils/Helpers"

export default {
  components: {
    Bucket,
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
  computed: {},
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
          id: Helpers.createUUID(),
          color: "#808080",
          text: "",
          imageUrl: "",
          bucketId: this.question.answerTypes.dragDrop.buckets[0].id,
        },
      ]
    }
  },
  methods: {
    getBuckets(type) {
      return this.question.answerTypes.dragDrop.buckets.filter(
        bucket => bucket.type === type
      )
    },
    addBucket(type) {
      this.question.answerTypes.dragDrop.buckets.push({
        id: Helpers.createUUID(),
        type: type,
        text: "",
      })
      this.$forceUpdate()
    },
    addItem(bucketId) {
      this.question.answerTypes.dragDrop.items.push({
        id: Helpers.createUUID(),
        color: "#808080",
        text: "",
        imageUrl: "",
        bucketId: bucketId,
      })
      this.$forceUpdate()
    },
    handleRemoveItem($event) {
      this.question.answerTypes.dragDrop.items.splice(
        this.question.answerTypes.dragDrop.items.findIndex(
          item => item.id === $event
        ),
        1
      )
      this.$forceUpdate()
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
