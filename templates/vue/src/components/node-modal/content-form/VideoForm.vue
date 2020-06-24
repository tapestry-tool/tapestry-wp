<template>
  <div>
    <b-form-group label="Video URL">
      <file-upload
        id="node-video-media-url"
        v-model="node.typeData.mediaURL"
        data-testid="node-videoUrl"
        placeholder="Enter URL for MP4 or YouTube video"
        required
      />
    </b-form-group>
    <div>
      <video
        v-if="node.mediaFormat === 'mp4'"
        ref="video"
        :src="node.typeData.mediaURL"
        style="display: none;"
        @loadeddata="setVideoDuration"
      ></video>
      <youtube
        v-if="node.mediaFormat === 'youtube'"
        :video-id="youtubeId"
        :player-vars="{ autoplay: 0 }"
        style="display: none;"
        @ready="setYouTubeDuration"
      ></youtube>
    </div>
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
  },
}
</script>
