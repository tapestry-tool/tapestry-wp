<template>
  <b-row>
    <b-col>
      <b-form-group label="Video URL">
        <file-upload
          id="node-video-media-url"
          v-model="mediaURL"
          input-test-id="node-video-url"
          placeholder="Enter URL for MP4 video"
          required
          @isUploading="handleUploadChange"
        />
      </b-form-group>
    </b-col>
  </b-row>
</template>

<script>
import { mapMutations } from "vuex"
import FileUpload from "@/components/modals/common/FileUpload"

export default {
  components: {
    FileUpload,
  },
  computed: {
    mediaURL: {
      get() {
        return this.$store.state.currentEditingNode.typeData.mediaURL
      },
      set(value) {
        this.update("typeData.mediaURL", value)
      },
    },
  },
  methods: {
    ...mapMutations(["setCurrentEditingNodeProperty", "addApiError"]),
    update(property, value) {
      this.setCurrentEditingNodeProperty({ property, value })
    },
    handleUploadChange(state) {
      this.$root.$emit("node-modal::uploading", state)
    },
  },
}
</script>
