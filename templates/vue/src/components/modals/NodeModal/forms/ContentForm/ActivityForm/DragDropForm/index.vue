<template>
  <b-overlay :show="hasAnswers && !override">
    <template #overlay>
      <div class="overlay p-3 mx-n4">
        <p>
          Some users have already answered this question. Editing the drag and drop
          might cause issues for those users at this point. It's highly recommended
          for you to recreate the activity node and just hide this node from all
          users from the access tab.
        </p>
        <b-button variant="danger" @click="override = true">
          I understand, but still want to continue
        </b-button>
      </div>
    </template>
    <b-form-group class="mt-2">
      <b-form-checkbox v-model="dragDrop.useImages" data-qa="dragdrop-use-images">
        Use Images
      </b-form-checkbox>
      <b-form-checkbox
        v-if="dragDrop.useImages"
        v-model="dragDrop.hideText"
        data-qa="dragdrop-hide-text"
      >
        Hide Text
      </b-form-checkbox>
      <b-row class="ml-1 mt-2">
        <b-col class="pl-0">
          <b-col>
            <b-row>Drag from:</b-row>
            <b-row v-for="bucket in getBuckets('from')" :key="bucket.id">
              <bucket
                :bucket="bucket"
                :items="getBucketsItems(bucket.id)"
                :bucketRemovalAllowed="bucketRemovalEnabled.from"
                :useImages="dragDrop.useImages"
                @update-name="handleUpdateName(bucket.id, $event)"
                @update-item="handleUpdateItem"
                @remove-item="handleRemoveItem"
                @remove-bucket="handleRemoveBucket"
                @add="addItem(bucket.id)"
              />
            </b-row>
            <b-row>
              <b-button
                class="add-btn"
                variant="primary"
                data-qa="add-from-bucket-button"
                @click="addBucket('from')"
              >
                Add bucket
              </b-button>
            </b-row>
          </b-col>
        </b-col>
        <b-col>
          <b-col>
            <b-row>Drag to:</b-row>
            <b-row v-for="bucket in getBuckets('to')" :key="bucket.id">
              <bucket
                :bucket="bucket"
                :bucketRemovalAllowed="bucketRemovalEnabled.to"
                @update-name="handleUpdateName(bucket.id, $event)"
                @remove-bucket="handleRemoveBucket"
              />
            </b-row>
            <b-row>
              <b-button
                class="add-btn"
                variant="primary"
                data-qa="add-to-bucket-button"
                @click="addBucket('to')"
              >
                Add bucket
              </b-button>
            </b-row>
          </b-col>
        </b-col>
      </b-row>
    </b-form-group>
  </b-overlay>
</template>

<script>
import Bucket from "./Bucket"
import Helpers from "@/utils/Helpers"
import client from "@/services/TapestryAPI"
import { mapState } from "vuex"

export default {
  components: {
    Bucket,
  },
  props: {
    value: {
      type: Object,
      required: true,
    },
    questionId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      dragDrop: this.value,
      bucketRemovalEnabled: { to: false, from: false },
      hasAnswers: false,
      override: false,
    }
  },
  computed: {
    ...mapState({
      nodeId: state => state.currentEditingNode.id,
    }),
  },
  watch: {
    dragDrop: {
      handler(val) {
        this.$emit("input", val)
      },
      deep: true,
    },
  },
  created() {
    client.questionHasAnswer(this.nodeId, this.questionId, "dragDrop").then(res => {
      this.hasAnswers = res.data
    })

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
    handleUpdateName(bucketId, name) {
      this.dragDrop.buckets.find(bucket => bucket.id === bucketId).text = name
    },
    handleUpdateItem({ id, property, value }) {
      this.dragDrop.items.find(item => item.id === id)[property] = value
    },
  },
}
</script>

<style lang="scss" scoped>
.add-btn {
  margin-top: 20px;
}
.overlay {
  width: 80%;
  background-color: #bdc3c7;
  border-radius: 10px;
}
</style>
