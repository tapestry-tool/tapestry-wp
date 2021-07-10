<template>
  <div class="container">
    <b-form-group :class="bucketClass">
      <b-form-group>
        <b-form-input
          v-model="bucket.text"
          placeholder="New Bucket"
          class="side"
          :data-qa="`from-bucket-label-${bucket.id}`"
        ></b-form-input>
        <b-button
          v-if="bucketRemovalAllowed"
          class="side"
          variant="outline-danger"
          @click="$emit('remove')"
        >
          Remove bucket
        </b-button>
      </b-form-group>
      <b-form-group>
        <drag-drop-item
          v-for="(item, index) in items"
          :key="item.id"
          :item="item"
          :useImages="useImages"
          :data-qa="`bucket-item-${bucket.id}-${item.id}`"
          :itemRemovalAllowed="itemRemovalAllowed"
          @remove="items.splice(index, 1)"
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
import DragDropItem from "./DragDropItem"
export default {
  components: {
    DragDropItem,
  },
  props: {
    bucket: {
      type: Object,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    useImages: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    bucketClass() {
      return this.bucket.type === "from"
        ? "from-bucket-container"
        : "to-bucket-container"
    },
    itemRemovalAllowed() {
      return this.items.length > 1
    },
  },
  created() {
    console.log(this.items)
  },
}
</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
}
.side {
  width: 47%;
  display: inline;
}
.from-bucket-container {
  background-color: #e0f2f1;
  margin-bottom: 15px;
  border-radius: 15px;
  margin-left: -15px;
  min-height: 200px;
  text-align: center;
}
.to-bucket-container {
  background-color: #e8eaf6;
  min-height: 200px;
  margin-bottom: 15px;
  margin-left: -15px;
  border-radius: 15px;
}
</style>
