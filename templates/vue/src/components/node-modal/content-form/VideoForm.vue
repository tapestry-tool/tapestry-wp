<template>
  <div>
    <b-form-group label="Video URL">
      <file-upload
        id="node-video-media-url"
        v-model="node.typeData.mediaURL"
        data-testid="node-videoUrl"
        placeholder="Enter URL for MP4 Video"
        required
      />
    </b-form-group>
    <b-form-group label="Video Duration">
      <b-form-input
        id="node-video-media-duration"
        v-model="node.mediaDuration"
        type="number"
        data-testid="node-videoDuration"
        placeholder="Enter duration (in seconds)"
        required
      />
    </b-form-group>
  </div>
</template>

<script>
import FileUpload from "@/components/FileUpload"

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
}
</script>
