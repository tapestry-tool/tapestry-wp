<template>
  <div>
    <b-row>
      <b-col>
        <b-overlay :show="useKaltura">
          <template #overlay><div></div></template>
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
        </b-overlay>
      </b-col>
    </b-row>
    <b-row class="mb-3">
      <b-col cols="1" style="text-align:right;">
        <i id="kaltura-info" class="far fa-question-circle"></i>
        <b-tooltip v-model="useKaltura" target="kaltura-info" triggers="hover">
          Video ID can be found in the Kaltura managment console under
          Content->Entries.
        </b-tooltip>
      </b-col>
      <b-col>
        <b-form-checkbox
          v-model="useKaltura"
          data-qa="use-kaltura-checkbox"
          :value="true"
          :unchecked-value="false"
          :disabled="isUploading"
          style="display:inline-block;"
          @input="handleKalturaCheck"
        >
          Use Kaltura Player
        </b-form-checkbox>
      </b-col>
      <b-col cols="6" md="8">
        <b-form-input
          v-show="useKaltura"
          v-model="kalturaId"
          data-qa="node-video-kaltura-id"
          name="text-input"
          placeholder="Enter Kaltura video ID"
          required
          :disabled="isUploading"
        />
      </b-col>
    </b-row>
    <b-overlay v-if="useKaltura" :show="isUploading">
      <b-card class="mb-3">
        <b-form-group
          class="my-0"
          label="Upload a video to Kaltura"
          description="Upload your video directly to Kaltura. The Kaltura ID will be automatically set when done."
        >
          <div class="d-flex flex-row">
            <b-form-file
              v-model="videoFile"
              placeholder="Choose a video or drop it here..."
              drop-placeholder="Drop file here..."
              accept="video/mp4"
              :disabled="isUploading"
            />
            <b-button class="ml-2" variant="primary" @click="uploadVideoToKaltura">
              Upload
            </b-button>
          </div>
        </b-form-group>
      </b-card>
    </b-overlay>
  </div>
</template>

<script>
import FileUpload from "@/components/modals/common/FileUpload"
import Helpers from "@/utils/Helpers"
import { mapMutations, mapState } from "vuex"
import client from "@/services/TapestryAPI"

export default {
  components: {
    FileUpload,
  },
  data() {
    return {
      videoFile: null,
      useKaltura: false,
      isUploading: false,
    }
  },
  computed: {
    ...mapState({
      mediaFormat: state => state.currentEditingNode.mediaFormat,
    }),
    mediaURL: {
      get() {
        return this.$store.state.currentEditingNode.typeData.mediaURL
      },
      set(value) {
        this.update("typeData.mediaURL", value)
      },
    },
    kalturaId: {
      get() {
        return this.$store.state.currentEditingNode.typeData.kalturaId
      },
      set(value) {
        this.update("typeData.kalturaId", value)
      },
    },
    youtubeId() {
      return Helpers.getYoutubeID(this.mediaURL)
    },
  },
  watch: {
    youtubeId(id) {
      this.updateMediaFormat(id)
    },
  },
  created() {
    if (this.mediaFormat === "kaltura") {
      this.useKaltura = true
    } else {
      this.updateMediaFormat(this.youtubeId)
    }
  },
  methods: {
    ...mapMutations(["setCurrentEditingNodeProperty", "addApiError"]),
    update(property, value) {
      this.setCurrentEditingNodeProperty({ property, value })
    },
    handleUploadChange(state) {
      this.$root.$emit("node-modal::uploading", state)
    },
    handleKalturaCheck() {
      if (this.useKaltura) {
        this.update("mediaFormat", "kaltura")
      } else {
        this.updateMediaFormat(this.youtubeId)
      }
    },
    updateMediaFormat(id) {
      if (id !== null) {
        this.update("mediaFormat", "youtube")
        this.update("typeData.youtubeID", id)
      } else {
        this.update("mediaFormat", "mp4")
        this.update("typeData.youtubeID", undefined)
      }
    },
    async uploadVideoToKaltura() {
      if (this.videoFile) {
        this.isUploading = true
        try {
          this.kalturaId = await client.uploadVideoToKaltura(this.videoFile)
        } catch (error) {
          this.addApiError(error)
        }
        this.isUploading = false
      }
    },
  },
}
</script>
