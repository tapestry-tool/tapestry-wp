<template>
  <b-form>
    <p>Current data is {{ node.typeData.options.dragDrop }}</p>
    <b-row align-h="between">
      <b-col cols="5">
        <p>From buckets</p>
        <user-drag-drop-bucket
          v-for="bucket in node.typeData.options.dragDrop.fromBucketArray"
          :key="bucket.id"
          :node="node"
          :bucket="bucket"
          :isFromBucket="true"
        />
      </b-col>
      <b-col cols="5">
        <p>To buckets</p>
        <user-drag-drop-bucket
          v-for="bucket in node.typeData.options.dragDrop.toBucketArray"
          :key="bucket.id"
          :node="node"
          :bucket="bucket"
          :isFromBucket="false"
        />
      </b-col>
    </b-row>

    <b-form-invalid-feedback :state="isAnswerValid">
      Please enter a response.
    </b-form-invalid-feedback>

    <b-button
      v-if="node.mediaType === 'question'"
      class="submit-btn mt-3"
      variant="primary"
      type="submit"
    >
      Submit
    </b-button>
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
    }
  },
  computed: {},
  methods: {},
}
</script>

<style scoped></style>
