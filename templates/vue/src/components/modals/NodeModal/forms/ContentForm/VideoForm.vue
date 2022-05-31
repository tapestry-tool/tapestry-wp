<template>
  <div>
    <b-form-group label="Video URL">
      <file-upload
        id="node-video-media-url"
        v-model="mediaURL"
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
import { mapMutations } from "vuex"

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
        this.$store.commit("setCurrentEditingNodeProperty", {
          property: "typeData.mediaURL",
          value,
        })
      },
    },
    youtubeId() {
      return Helpers.getYoutubeID(this.mediaURL)
    },
  },
  watch: {
    youtubeId(id) {
      if (id !== null) {
        this.update("mediaFormat", "youtube")
        this.update("typeData.youtubeID", id)
      } else {
        this.update("mediaFormat", "mp4")
        this.update("typeData.youtubeID", undefined)
      }
    },
  },
  methods: {
    ...mapMutations(["setCurrentEditingNodeProperty"]),
    update(property, value) {
      this.setCurrentEditingNodeProperty({ property, value })
    },
    handleUploadChange(state) {
      this.$root.$emit("node-modal::uploading", state)
    },
  },
}
</script>
