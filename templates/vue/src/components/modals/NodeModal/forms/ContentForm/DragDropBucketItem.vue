<template>
  <div class="container">
    <b-form-group class="contents">
      <b>New bucket item</b>
      <p>Text Value is:{{ bucketItem.text }}</p>
      <p>Color picker component here</p>
      <b-form-checkbox v-model="addBackgroundImage" data-qa="bucketItem-useImage">
        Background image
      </b-form-checkbox>
      <b-form-group v-if="addBackgroundImage">
        <file-upload
          v-model="bucketItem.imageurl"
          input-test-id="node-bucketitem-thumbnail-url"
          :data-qa="`dragdrop-bucketitem-thumbnail-${bucketItem.id}`"
          :show-url-upload="false"
          thumbnail-type="thumbnail"
          :show-image-preview="true"
          file-types="image/*"
          @isUploading="handleUploadChange"
        />
      </b-form-group>
      <b-form-checkbox
        v-if="addBackgroundImage"
        v-model="addText"
        data-qa="bucketItem-addText"
      >
        Text
      </b-form-checkbox>
      <b-form-input
        v-if="addText"
        v-model="bucketItem.text"
        placeholder="Enter Item Text"
      ></b-form-input>
    </b-form-group>
    <b-button
      :disabled="removeItemDisabled"
      squared
      variant="outline-danger"
      @click="$emit('remove')"
    >
      Remove item
    </b-button>
  </div>
</template>

<script>
import FileUpload from "@/components/modals/common/FileUpload"

export default {
  components: {
    FileUpload,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    bucketItem: {
      type: Object,
      required: true,
    },
    removeItemDisabled: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      fromBucketItem: [
        {
          id: 1,
          color: "#808080",
          imageurl: "",
          text: "",
        },
      ],
      nextFromBucketId: 2,
      addBackgroundImage: false,
      addText: false,
    }
  },
  computed: {
    bucketClass() {
      if (this.isFromBucket) {
        return "fromBucketContainer"
      } else {
        return "toBucketContainer"
      }
    },
  },
  watch: {
    addBackgroundImage(newAddBackgroundImage) {
      this.bucketItem.useImage = newAddBackgroundImage
    },
    addText(newAddText) {
      this.bucketItem.useText = newAddText
    },
  },
  created() {
    if (this.bucketItem.useText) {
      this.addBackgroundImage = true
    }
    if (this.bucketItem.useImage) {
      this.addText = true
    }
  },
  methods: {
    handleUploadChange(state) {
      this.$root.$emit("node-modal::uploading", state)
    },
  },
}
</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
  background-color: #add8e6;
  margin-bottom: 15px;
}

.contents {
  flex-direction: column;
}
</style>
