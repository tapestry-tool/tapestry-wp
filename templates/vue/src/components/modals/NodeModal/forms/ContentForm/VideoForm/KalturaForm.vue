<template>
  <div>
    <b-overlay :show="isUploading">
      <b-form-group label="Kaltura ID">
        <b-row>
          <b-col class="pr-0">
            <b-form-file
              ref="fileInput"
              placeholder="Select or drop video to upload"
              drop-placeholder="Drop file here..."
              accept="video/mp4"
              :disabled="disableFields || isUploading"
              @drop.prevent="uploadToKaltura"
              @change="uploadToKaltura"
            />
          </b-col>
          <b-col cols="1" class="d-flex align-items-center justify-content-center">
            <h6 class="m-0 text-muted">OR</h6>
          </b-col>
          <b-col class="pl-0">
            <b-input-group>
              <b-form-input
                v-model="kalturaId"
                class="rounded-left"
                data-qa="node-video-kaltura-id"
                name="text-input"
                placeholder="Enter Kaltura video ID"
                required
                :disabled="disableFields || isUploading"
              />
              <b-input-group-append is-text>
                <i
                  id="kaltura-info"
                  class="far fa-question-circle"
                  :tabindex="disableFields ? -1 : 0"
                  aria-label="Kaltura ID hint"
                ></i>
                <b-tooltip role="tooltip" target="kaltura-info">
                  Video ID can be found in the Kaltura managment console under
                  Content->Entries.
                </b-tooltip>
              </b-input-group-append>
            </b-input-group>
          </b-col>
        </b-row>
      </b-form-group>
    </b-overlay>
    <b-alert v-if="uploadAlertText" show variant="success">
      <b-row>
        <b-col>{{ uploadAlertText }}</b-col>
        <b-col cols="1" class="d-flex align-items-center">
          <b-button size="sm" variant="secondary" @click="uploadAlertText = ''">
            OK
          </b-button>
        </b-col>
      </b-row>
    </b-alert>
    <b-row>
      <b-col>
        <b-form-group label="Video Player">
          <b-form-radio-group
            id="node-video-player"
            v-model="videoPlayer"
            data-qa="node-video-player"
            name="node-video-player"
            :options="[
              { text: 'Regular Player', value: 'regular' },
              { text: 'Kaltura Player', value: 'kaltura' },
            ]"
            :disabled="disableFields"
          ></b-form-radio-group>
        </b-form-group>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex"
import KalturaAPI from "@/services/KalturaAPI"
import ErrorHelper from "@/utils/errorHelper"
import * as wp from "@/services/wp"

export default {
  props: {
    disableFields: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  data() {
    return {
      isUploading: false,
      uploadAlertText: "",
    }
  },
  computed: {
    ...mapState({
      nodeId: state => state.currentEditingNode.id,
    }),
    kalturaId: {
      get() {
        return this.$store.state.currentEditingNode.typeData.kalturaId
      },
      set(value) {
        this.update("typeData.kalturaId", value)
      },
    },
    kalturaAvailable() {
      return wp.getKalturaStatus()
    },
    videoPlayer: {
      get() {
        return this.$store.state.currentEditingNode.typeData.videoPlayer ?? "regular"
      },
      set(value) {
        if (["regular", "kaltura"].includes(value)) {
          this.update("typeData.videoPlayer", value)
        }
      },
    },
  },
  methods: {
    ...mapMutations(["setCurrentEditingNodeProperty", "addApiError"]),
    update(property, value) {
      this.setCurrentEditingNodeProperty({ property, value })
    },
    async uploadToKaltura(event) {
      const videoFile =
        event.dataTransfer && event.dataTransfer.files
          ? event.dataTransfer.files[0]
          : event.target.files[0]

      if (videoFile && this.kalturaAvailable) {
        this.isUploading = true
        this.$root.$emit("node-modal::uploading", true)
        this.uploadAlertText = ""

        try {
          const kalturaId = await KalturaAPI.uploadVideo(videoFile, this.nodeId)
          this.kalturaId = kalturaId
          this.uploadAlertText = `
            Upload completed successfully. Your video has Kaltura ID ${kalturaId}.
            Make sure to publish / save to keep this video.`
        } catch (error) {
          const errorMessage = ErrorHelper.getErrorMessage(error)
          this.addApiError({ error: `Unable to upload video: ${errorMessage}` })
        }

        this.isUploading = false
        this.$root.$emit("node-modal::uploading", false)
        this.$refs.fileInput.reset()
      }
    },
  },
}
</script>
