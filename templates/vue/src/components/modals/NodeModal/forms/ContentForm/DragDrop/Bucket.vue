<template>
  <div>
    <b-form-group>
      <b-form-input
        v-model="bucket.text"
        placeholder="New Bucket"
        class=" side"
        :data-qa="`from-bucket-label-${bucket.id}`"
      ></b-form-input>
      <b-button
        v-if="bucketRemovalAllowed"
        class="side"
        variant="outline-danger"
        @click="$emit('remove-bucket', bucket.id)"
      >
        Remove bucket
      </b-button>
    </b-form-group>
    <b-form-group class="bucket-container">
      <b-form-group v-if="items">
        <item
          v-for="item in items"
          :key="item.id"
          :item="item"
          :useImages="useImages"
          :data-qa="`bucket-item-${bucket.id}-${item.id}`"
          :itemRemovalAllowed="itemRemovalAllowed"
          @remove-item="$emit('remove-item', item.id)"
        />
      </b-form-group>
      <b-button
        v-if="bucket.type === 'from'"
        variant="primary"
        :data-qa="`add-bucket-item-button-${bucket.id}`"
        @click="$emit('add')"
      >
        Add item
      </b-button>
    </b-form-group>
  </div>
</template>

<script>
import Item from "./Item"
export default {
  name: "bucket",
  components: {
    Item,
  },
  props: {
    bucket: {
      type: Object,
      required: true,
    },
    items: {
      type: Array,
      required: false,
      default: null,
    },
    useImages: {
      type: Boolean,
      required: false,
      default: false,
    },
    bucketRemovalAllowed: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    itemRemovalAllowed() {
      return this.items.length > 1
    },
  },
}
</script>

<style scoped>
.bucket-container {
  background-color: #e0f2f1;
  border-radius: 15px;
  max-width: 300px;
  text-align: center;
}
.to-bucket-container {
  background-color: #e8eaf6;
  min-height: 50px;
  margin-bottom: 15px;
  margin-left: -15px;
  border-radius: 15px;
}
</style>
