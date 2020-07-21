<template>
  <div>
    <b-form-group label="Video URL">
      <file-upload
        id="node-video-media-url"
        v-model="node.typeData.mediaURL"
        data-testid="node-videoUrl"
        placeholder="Enter URL for MP4 or YouTube video"
        required
        @isUploading="handleUploadChange"
      />
    </b-form-group>
  </div>
</template>

<script>
import FileUpload from "@/components/FileUpload"
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
        this.node.mediaFormat = "youtube"
        this.node.typeData.youtubeID = id
      } else {
        this.node.mediaFormat = "mp4"
        this.node.typeData.youtubeID = undefined
      }
    },
  },
  methods: {
    setYouTubeDuration(evt) {
      this.node.mediaDuration = evt.target.getDuration()
      this.$emit("load")
    },
    setVideoDuration() {
      this.node.mediaDuration = this.$refs.video.duration
      this.$emit("load")
    },
    handleUploadChange(state) {
      this.$root.$emit("node-modal::uploading", state)
    },
  },
}
</script>
