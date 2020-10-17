<template>
  <div>
    <b-form-group :label="videoLabel">
      <file-upload
        id="node-video-media-url"
        v-model="node.typeData.mediaURL"
        input-test-id="node-videoUrl"
        placeholder="Enter URL for MP4 or YouTube video"
        required
        @isUploading="handleUploadChange"
      />
      <b-form-text v-if="showVideoDescription">
        This video should not include any screenshots of the stage layout.
      </b-form-text>
    </b-form-group>
  </div>
</template>

<script>
import FileUpload from "@/components/FileUpload"
import Helpers from "@/utils/Helpers"
import { tydeTypes } from "@/utils/constants"

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
    showVideoDescription() {
      return (
        this.node.tydeType === tydeTypes.STAGE ||
        this.node.tydeType === tydeTypes.MODULE
      )
    },
    videoLabel() {
      const labels = {
        [tydeTypes.STAGE]: "Pre-Stage Video URL",
        [tydeTypes.MODULE]: "Module Completion Video URL",
      }
      return labels[this.node.tydeType] || "Video URL"
    },
  },
  watch: {
    youtubeId(id) {
      if (id !== null) {
        this.node.mediaFormat = "youtube"
        this.node.typeData.youtubeID = id
      } else {
        this.node.mediaFormat = "mp4"
        this.node.typeData.youtubeID = undefined
      }
    },
  },
  methods: {
    handleUploadChange(state) {
      this.$root.$emit("node-modal::uploading", state)
    },
  },
}
</script>
