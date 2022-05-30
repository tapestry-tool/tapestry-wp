<template>
  <div>
    <b-form-group label="Video URL">
      <file-upload
        id="node-video-media-url"
        :value="node.typeData.mediaURL"
        @input="change('typeData.mediaURL', $event)"
        input-test-id="node-video-url"
        placeholder="Enter URL for MP4 or YouTube video"
        required
        @isUploading="handleUploadChange"
      />
    </b-form-group>
  </div>
</template>

<script>
import FileUpload from "@/components/modals/common/FileUpload"
import Helpers from "@/utils/Helpers"

export default {
  components: {
    FileUpload,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  computed: {
    youtubeId() {
      return Helpers.getYoutubeID(this.node.typeData.mediaURL)
    },
  },
  watch: {
    youtubeId(id) {
      if (id !== null) {
        this.change("mediaFormat", "youtube")
        this.change("typeData.youtubeID", id)
      } else {
        this.change("mediaFormat", "mp4")
        this.change("typeData.youtubeID", undefined)
      }
    },
  },
  methods: {
    handleUploadChange(state) {
      this.$root.$emit("node-modal::uploading", state)
    },
    change(property, value) {
      this.$emit("property-change", property, value)
    },
  },
}
</script>
