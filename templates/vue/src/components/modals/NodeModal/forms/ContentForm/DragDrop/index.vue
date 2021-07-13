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
        :bucketRemovalAllowed="bucketRemovalEnabled.from"
        :useImages="question.answerTypes.dragDrop.useImages"
        :data-qa="`from-bucket-${bucket.id}`"
        @remove-item="handleRemoveItem"
        @remove-bucket="handleRemoveBucket"
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
        :bucketRemovalAllowed="bucketRemovalEnabled.to"
        :data-qa="`to-bucket-${bucket.id}`"
        @remove-bucket="handleRemoveBucket"
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
  data() {
    return { bucketRemovalEnabled: { to: false, from: false } }
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
    } else {
      Object.keys(this.bucketRemovalEnabled).forEach(type => {
        if (this.getBuckets(type).length > 1) this.bucketRemovalEnabled[type] = true
      })
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
      this.bucketRemovalEnabled[type] = true
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
    handleRemoveItem(itemId) {
      this.question.answerTypes.dragDrop.items.splice(
        this.question.answerTypes.dragDrop.items.findIndex(
          item => item.id === itemId
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
    handleRemoveBucket(bucketId) {
      const itemsInBucket = this.getBucketsItems(bucketId)
      itemsInBucket.forEach(item => this.handleRemoveItem(item.id))

      const bucketIndex = this.question.answerTypes.dragDrop.buckets.findIndex(
        bucket => bucket.id === bucketId
      )

      const bucketType = this.question.answerTypes.dragDrop.buckets[bucketIndex].type
      if (this.getBuckets(bucketType).length - 1 == 1)
        this.bucketRemovalEnabled[bucketType] = false

      this.question.answerTypes.dragDrop.buckets.splice(bucketIndex, 1)
    },
  },
}
</script>

<style scoped>
.add-btn {
  margin-top: 20px;
}
</style>
