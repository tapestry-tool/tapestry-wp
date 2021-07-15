<template>
  <div>
    <b-form-group>
      <b-form-checkbox v-model="dragDrop.useImages" data-qa="dragdrop-useImages">
        Use Images
      </b-form-checkbox>
      <b-form-checkbox
        v-if="dragDrop.useImages"
        v-model="dragDrop.hideText"
        data-qa="dragdrop-useImages"
      >
        Hide Text
      </b-form-checkbox>
      <b-col>
        <b-row><b>From buckets</b></b-row>
        <b-row v-for="bucket in getBuckets('from')" :key="bucket.id">
          <bucket
            :bucket="bucket"
            :items="getBucketsItems(bucket.id)"
            :bucketRemovalAllowed="bucketRemovalEnabled.from"
            :useImages="dragDrop.useImages"
            :data-qa="`from-bucket-${bucket.id}`"
            @remove-item="handleRemoveItem"
            @remove-bucket="handleRemoveBucket"
            @add="addItem(bucket.id)"
          />
        </b-row>
        <b-row>
          <b-button
            class="add-btn"
            variant="primary"
            squared
            data-qa="add-from-bucket-button"
            @click="addBucket('from')"
          >
            Add bucket
          </b-button>
        </b-row>
      </b-col>
    </b-form-group>
    <b-form-group>
      <b-col>
        <b-row><b>To buckets</b></b-row>
        <b-row v-for="bucket in getBuckets('to')" :key="bucket.id">
          <bucket
            :bucket="bucket"
            :bucketRemovalAllowed="bucketRemovalEnabled.to"
            :data-qa="`to-bucket-${bucket.id}`"
            @remove-bucket="handleRemoveBucket"
          />
        </b-row>
        <b-row>
          <b-button
            class="add-btn"
            variant="primary"
            squared
            data-qa="add-to-bucket-button"
            @click="addBucket('to')"
          >
            Add bucket
          </b-button>
        </b-row>
      </b-col>
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
    dragDrop: {
      type: Object,
      required: true,
    },
  },
  data() {
    return { bucketRemovalEnabled: { to: false, from: false } }
  },
  created() {
    if (!this.dragDrop?.buckets) {
      this.dragDrop.buckets = [
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

    if (!this.dragDrop?.items) {
      this.dragDrop.items = [
        {
          id: Helpers.createUUID(),
          color: "#808080",
          text: "",
          imageUrl: "",
          bucketId: this.dragDrop.buckets[0].id,
        },
      ]
    }
  },
  methods: {
    getBuckets(type) {
      return this.dragDrop.buckets.filter(bucket => bucket.type === type)
    },
    addBucket(type) {
      this.dragDrop.buckets.push({
        id: Helpers.createUUID(),
        type: type,
        text: "",
      })
      this.bucketRemovalEnabled[type] = true
      this.$forceUpdate()
    },
    addItem(bucketId) {
      this.dragDrop.items.push({
        id: Helpers.createUUID(),
        color: "#808080",
        text: "",
        imageUrl: "",
        bucketId: bucketId,
      })
      this.$forceUpdate()
    },
    handleRemoveItem(itemId) {
      this.dragDrop.items.splice(
        this.dragDrop.items.findIndex(item => item.id === itemId),
        1
      )
      this.$forceUpdate()
    },
    getBucketsItems(bucketId) {
      return this.dragDrop.items.filter(item => item.bucketId === bucketId)
    },
    handleRemoveBucket(bucketId) {
      const itemsInBucket = this.getBucketsItems(bucketId)
      itemsInBucket.forEach(item => this.handleRemoveItem(item.id))

      const bucketIndex = this.dragDrop.buckets.findIndex(
        bucket => bucket.id === bucketId
      )

      const bucketType = this.dragDrop.buckets[bucketIndex].type
      if (this.getBuckets(bucketType).length - 1 == 1)
        this.bucketRemovalEnabled[bucketType] = false

      this.dragDrop.buckets.splice(bucketIndex, 1)
      this.$forceUpdate()
    },
  },
}
</script>

<style scoped>
.add-btn {
  margin-top: 20px;
}
</style>
