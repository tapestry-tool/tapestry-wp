<template>
  <div class="container">
    <div>
      <b-form-input
        v-model="item.text"
        placeholder="New Item"
        :data-qa="`bucket-item-text-${item.bucketId}`"
      ></b-form-input>
      <color-picker
        label="Background color"
        :data-qa="`bucket-item-backgroundcolor-${item.bucketId}`"
        :currentColor="item.color"
        @change="item.color = $event"
      />
      <b-form-group v-if="useImages">
        <file-upload
          v-model="item.imageUrl"
          input-test-id="node-bucketitem-thumbnail-url"
          :data-qa="`bucket-item-thumbnail-${item.bucketId}`"
          :show-url-upload="false"
          :show-image-preview="true"
          :compact-mode="true"
          file-types="image/*"
          @isUploading="handleUploadChange"
        />
      </b-form-group>

      <b-button
        v-if="itemRemovalAllowed"
        squared
        variant="outline-danger"
        @click="$emit('remove-item')"
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
    item: {
      type: Object,
      required: true,
    },
    itemRemovalAllowed: {
      type: Boolean,
      required: true,
    },
    useImages: {
      type: Boolean,
      required: true,
    },
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
  border: solid;
  background-color: #add8e6;
  margin: 10px 0;
  border-radius: 15px;
  margin-left: 0px;
  padding: 1rem;
}
</style>
