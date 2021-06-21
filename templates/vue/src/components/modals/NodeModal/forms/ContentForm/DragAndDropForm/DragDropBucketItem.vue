<template>
  <div class="container">
    <div>
      <b>New bucket item</b>
      <color-picker
        label="Background color"
        :currentColor="bucketItem.color"
        :data-qa="`bucket-item-backgroundcolor-${bucketItem.id}`"
        @change="handleItemColorChange"
      />
      <b-form-checkbox
        v-model="addBackgroundImage"
        :data-qa="`bucket-item-useimage-${bucketItem.id}`"
      >
        Background image
      </b-form-checkbox>
      <b-form-group v-if="addBackgroundImage">
        <file-upload
          v-model="bucketItem.imageurl"
          input-test-id="node-bucketitem-thumbnail-url"
          :data-qa="`bucket-item-thumbnail-${bucketItem.id}`"
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
        :data-qa="`bucket-item-usetext-${bucketItem.id}`"
      >
        Text
      </b-form-checkbox>
      <b-form-input
        v-if="addText"
        v-model="bucketItem.text"
        placeholder="Enter Item Text"
        :data-qa="`bucket-item-text-${bucketItem.id}`"
      ></b-form-input>
      <b-button
        v-if="removeItemPresent"
        squared
        variant="outline-danger"
        @click="$emit('remove')"
      >
        Remove item
      </b-button>
    </div>
  </div>
</template>

<script>
import FileUpload from "@/components/modals/common/FileUpload"
import ColorPicker from "@/components/modals/common/ColorPicker"
export default {
  components: {
    FileUpload,
    ColorPicker,
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
    removeItemPresent: {
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
    if (this.bucketItem.useText && this.bucketItem.text.length > 0) {
      this.addText = true
    }
    this.addBackgroundImage =
      this.bucketItem.imageurl !== null && this.bucketItem.imageurl !== ""
  },
  methods: {
    handleUploadChange(state) {
      this.$root.$emit("node-modal::uploading", state)
    },
    handleItemColorChange(color) {
      this.bucketItem.color = color
    },
  },
}
</script>

<style scoped>
.container {
  border: solid;
  background-color: #add8e6;
  margin-bottom: 15px;
  border-radius: 15px;
  margin-left: 0px;
}
</style>
