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
              :disabled="isUploading"
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
                :disabled="isUploading"
              />
              <b-input-group-append is-text>
                <i
                  id="kaltura-info"
                  class="far fa-question-circle"
                  tabindex="0"
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
    <b-row>
      <b-col>
        <b-form-group label="Video Player">
          <b-form-radio-group
            id="node-video-player"
            v-model="videoPlayer"
            name="node-video-player"
            :options="[
              { text: 'Regular Player', value: 'regular' },
              { text: 'Kaltura Player', value: 'kaltura' },
            ]"
          ></b-form-radio-group>
        </b-form-group>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapMutations } from "vuex"
import client from "@/services/TapestryAPI"

export default {
  data() {
    return {
      isUploading: false,
    }
  },
  computed: {
    kalturaId: {
      get() {
        return this.$store.state.currentEditingNode.typeData.kalturaId
      },
      set(value) {
        this.update("typeData.kalturaId", value)
      },
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

      if (videoFile) {
        this.isUploading = true
        this.$root.$emit("node-modal::uploading", true)

        try {
          this.kalturaId = await client.uploadVideoToKaltura(videoFile)
        } catch (error) {
          this.addApiError(error)
        }

        this.isUploading = false
        this.$root.$emit("node-modal::uploading", false)
        this.$refs.fileInput.reset()
      }
    },
  },
}
</script>
