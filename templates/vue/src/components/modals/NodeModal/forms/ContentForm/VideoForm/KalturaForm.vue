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
              :disabled="disableFields || isUploading || isLoadingKalturaData"
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
                :placeholder="
                  editingKalturaId
                    ? 'Enter Kaltura video ID'
                    : 'Click Change to edit'
                "
                required
                :disabled="
                  disableFields ||
                    isUploading ||
                    isLoadingKalturaData ||
                    !editingKalturaId
                "
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
              <b-input-group-append>
                <b-button
                  variant="primary"
                  class="edit-kaltura-id-button"
                  data-qa="edit-kaltura-id-button"
                  :aria-label="editingKalturaId ? 'Submit' : 'Edit Kaltura ID'"
                  :disabled="disableFields || isUploading || isLoadingKalturaData"
                  @click="handleKalturaIdEdit"
                >
                  {{ editingKalturaId ? "Submit" : "Change" }}
                </b-button>
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
import { mapMutations, mapState, mapActions } from "vuex"
import ErrorHelper from "@/utils/errorHelper"
import * as wp from "@/services/wp"
import KalturaAPI from "@/services/KalturaAPI"

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
      kalturaId: this.$store.state.currentEditingNode.typeData.kalturaId,
      editingKalturaId: false,
      isLoadingKalturaData: false,
      isUploading: false,
      uploadAlertText: "",
    }
  },
  computed: {
    ...mapState({
      nodeId: state => state.currentEditingNode.id,
    }),
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
  created() {
    if (this.kalturaId) {
      this.setKalturaVideo(this.kalturaId)
    }
  },
  methods: {
    ...mapMutations(["setCurrentEditingNodeProperty"]),
    ...mapMutations({ addError: "addApiError" }),
    ...mapActions(["addApiError"]),
    update(property, value) {
      this.setCurrentEditingNodeProperty({ property, value })
    },
    handleKalturaIdEdit() {
      if (this.editingKalturaId) {
        this.setKalturaVideo(this.kalturaId)
      }
      this.editingKalturaId = !this.editingKalturaId
    },
    async setKalturaVideo(kalturaId, skipCheck) {
      this.$emit("load-start")
      this.isLoadingKalturaData = true

      if (this.kalturaAvailable) {
        try {
          const validKalturaVideo =
            skipCheck || (await KalturaAPI.getVideoStatus(kalturaId))

          if (validKalturaVideo) {
            this.update("typeData.kalturaId", kalturaId)
            await this.getKalturaCaptions(kalturaId)
          } else {
            this.addError({ error: "Please enter a valid Kaltura video ID." })
          }
        } catch (error) {
          // Kaltura availability changed unexpectedly
          this.addApiError(error)
        }
      }

      this.$emit("load-end")
      this.isLoadingKalturaData = false
    },
    async getKalturaCaptions(kalturaId) {
      // Loads captions, assuming Kaltura is available on the server
      const result = await KalturaAPI.getVideoCaptions(kalturaId)

      this.update("typeData.defaultCaptionId", result.defaultCaptionId)
      this.update("typeData.captions", result.captions)
    },
    async uploadToKaltura(event) {
      const videoFile =
        event.dataTransfer && event.dataTransfer.files
          ? event.dataTransfer.files[0]
          : event.target.files[0]

      if (videoFile && this.kalturaAvailable) {
        this.editingKalturaId = false
        this.isUploading = true
        this.$root.$emit("node-modal::uploading", true)
        this.uploadAlertText = ""

        try {
          const kalturaId = await KalturaAPI.uploadVideo(videoFile, this.nodeId)
          this.kalturaId = kalturaId
          this.uploadAlertText = `
            Upload completed successfully. Your video has Kaltura ID ${kalturaId}.
            Make sure to publish / save to keep this video.`
          this.setKalturaVideo(kalturaId, true)
        } catch (error) {
          const errorMessage = ErrorHelper.getErrorMessage(error)
          this.addError({ error: `Unable to upload video: ${errorMessage}` })
        }

        this.isUploading = false
        this.$root.$emit("node-modal::uploading", false)
        this.$refs.fileInput.reset()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.edit-kaltura-id-button {
  z-index: 1 !important; // Prevent button from appearing above NodeModal error banner
}
</style>
