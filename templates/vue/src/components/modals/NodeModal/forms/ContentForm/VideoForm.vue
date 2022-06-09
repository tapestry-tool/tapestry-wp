<template>
  <div>
    <b-row>
      <b-col>
        <b-overlay :show="useKaltura">
          <template #overlay><div></div></template>
          <b-form-group label="Video URL">
            <file-upload
              id="node-video-media-url"
              v-model="node.typeData.mediaURL"
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
          :value="true"
          :unchecked-value="false"
          style="display:inline-block;"
          @input="handleKalturaCheck"
        >
          Use Kaltura Player
        </b-form-checkbox>
      </b-col>
      <b-col cols="6" md="8">
        <b-form-input
          v-show="useKaltura"
          v-model="node.typeData.kalturaId"
          name="text-input"
          placeholder="Enter Kaltura video ID"
          required
        />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import FileUpload from "@/components/modals/common/FileUpload"
import Helpers from "@/utils/Helpers"
import { mapMutations, mapState } from "vuex"

export default {
  components: {
    FileUpload,
  },
  data() {
    return {
      useKaltura: false,
    }
  },
  computed: {
    ...mapState({
      node: "currentEditingNode",
    }),
    mediaURL: {
      get() {
        return this.$store.state.currentEditingNode.typeData.mediaURL
      },
      set(value) {
        this.update("typeData.mediaURL", value)
      },
    },
    youtubeId() {
      return Helpers.getYoutubeID(this.mediaURL)
    },
  },
  watch: {
    youtubeId(id) {
      this.updateFormatType(id)
    },
  },
  created() {
    if (typeof this.node.typeData.kalturaId === "undefined") {
      this.update("typeData.kalturaId", "")
    } else if (this.node.typeData.kalturaId !== "") {
      this.useKaltura = true
    }
  },
  methods: {
    ...mapMutations(["setCurrentEditingNodeProperty"]),
    update(property, value) {
      this.setCurrentEditingNodeProperty({ property, value })
    },
    handleUploadChange(state) {
      this.$root.$emit("node-modal::uploading", state)
    },
    handleKalturaCheck() {
      // If Kaltura is checked or unchecked, the mediaURL should be cleared as it depends on the Kaltura ID
      this.update("typeData.mediaURL", "")
      if (this.useKaltura) {
        this.update("mediaFormat", "kaltura")
      } else {
        this.update("typeData.kalturaId", "")
        this.updateFormatType(this.youtubeId)
      }
    },
    updateFormatType(id) {
      if (id !== null) {
        this.update("mediaFormat", "youtube")
        this.update("typeData.youtubeID", id)
      } else {
        this.update("mediaFormat", "mp4")
        this.update("typeData.youtubeID", undefined)
      }
    },
  },
}
</script>
