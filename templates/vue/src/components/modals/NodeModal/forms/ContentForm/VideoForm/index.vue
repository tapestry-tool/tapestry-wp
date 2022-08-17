<template>
  <div>
    <b-row>
      <b-col>
        <b-overlay :show="useKaltura">
          <template #overlay><div></div></template>
          <b-form-group label="Video source">
            <file-upload
              id="node-video-media-url"
              v-model="mediaURL"
              input-test-id="node-video-url"
              placeholder="Enter URL for MP4 or YouTube video"
              required
              :disabled="useKaltura"
              @isUploading="handleUploadChange"
            />
          </b-form-group>
        </b-overlay>
      </b-col>
    </b-row>
    <b-row class="mb-3">
      <b-col>
        <b-form-checkbox
          :checked="useKaltura"
          switch
          :disabled="disableKalturaToggle"
          data-qa="use-kaltura-toggle"
          style="display:inline-block;"
          @change="handleFormatChange($event)"
        >
          Use Kaltura Player
        </b-form-checkbox>
      </b-col>
    </b-row>
    <b-overlay :show="disableFields">
      <template #overlay>
        <div class="no-kaltura-notice">
          This information cannot be edited because Kaltura is not available on the
          server.
        </div>
      </template>
      <b-row
        v-if="useKaltura"
        :aria-hidden="disableFields"
        class="mb-3 align-items-center"
      >
        <b-col cols="3">
          Kaltura ID:
        </b-col>
        <b-col>
          <b-input-group>
            <b-form-input
              v-model="kalturaId"
              :disabled="isLoadingKalturaCaptions || !editingKalturaId"
              class="rounded-left"
              data-qa="node-video-kaltura-id"
              name="text-input"
              :placeholder="
                editingKalturaId ? 'Enter Kaltura video ID' : 'Click Change to edit'
              "
              required
            />
            <b-input-group-append is-text>
              <i
                id="kaltura-info"
                class="far fa-question-circle"
                aria-label="Kaltura ID hint"
                :tabindex="disableFields ? -1 : 0"
              ></i>
              <b-tooltip role="tooltip" target="kaltura-info">
                Video ID can be found in the Kaltura managment console under
                Content->Entries.
              </b-tooltip>
            </b-input-group-append>
            <b-input-group-append>
              <b-button
                variant="primary"
                data-qa="edit-kaltura-id-button"
                :aria-label="editingKalturaId ? 'Submit' : 'Edit Kaltura ID'"
                :disabled="disableFields || isLoadingKalturaCaptions"
                @click="handleKalturaIdEdit"
              >
                {{ editingKalturaId ? "Submit" : "Change" }}
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-col>
      </b-row>
      <b-row :aria-hidden="disableFields">
        <b-col>
          <b-overlay :show="isLoadingKalturaCaptions">
            <b-form-group label="Captions">
              <b-form-checkbox
                :checked="useCaptions"
                data-qa="node-captions-toggle"
                switch
                :disabled="disableFields"
                @change="handleToggleCaptions"
              >
                {{ useCaptions ? "On" : "Off" }}
              </b-form-checkbox>
              <template v-if="useCaptions">
                <caption-row
                  v-for="(caption, index) in captions"
                  :key="caption.id"
                  :value="caption"
                  :index="index"
                  :disabled="disableFields"
                  :is-kaltura="useKaltura"
                  :is-removable="captions.length >= 2"
                  :is-default="caption.id === defaultCaptionId"
                  :languages="languages"
                  @input="captions.splice(index, 1, $event)"
                  @setDefault="defaultCaptionId = $event"
                  @remove="removeCaption(index, caption)"
                ></caption-row>
                <b-button
                  class="mt-3"
                  data-qa="add-caption-button"
                  :disabled="disableFields"
                  @click="addCaption"
                >
                  <i class="fas fa-plus icon"></i>
                  Add caption
                </b-button>
              </template>
            </b-form-group>
          </b-overlay>
          <b-form-group v-if="pendingCaptions.length > 0" label="Pending captions">
            <caption-row
              v-for="(caption, index) in pendingCaptions"
              :key="caption.id"
              :value="caption"
              :index="index"
              is-removable
              is-pending
              :disabled="disableFields"
              :is-kaltura="useKaltura"
              :languages="languages"
              :error-message="caption.errorMessage"
              @input="pendingCaptions.splice(index, 1, $event)"
              @move="moveFromPending(index, caption)"
              @remove="removePendingCaption(index)"
            ></caption-row>
          </b-form-group>
        </b-col>
      </b-row>
    </b-overlay>
  </div>
</template>

<script>
import ISO6391 from "iso-639-1"
import FileUpload from "@/components/modals/common/FileUpload"
import client from "@/services/TapestryAPI"
import { getKalturaStatus } from "@/services/wp"
import Helpers from "@/utils/Helpers"
import { mapMutations, mapState } from "vuex"
import CaptionRow from "./CaptionRow"

const defaultCaption = {
  captionUrl: "",
  language: "English",
  label: undefined,
  displayOnPlayer: true,
}

export default {
  components: {
    FileUpload,
    CaptionRow,
  },
  data() {
    return {
      useKaltura: false,
      disableKalturaToggle: false,
      kalturaId: this.$store.state.currentEditingNode.typeData.kalturaId,
      editingKalturaId: false,
      isLoadingKalturaCaptions: false,
      languages: [],
    }
  },
  computed: {
    ...mapState({
      mediaFormat: state => state.currentEditingNode.mediaFormat,
    }),
    kalturaAvailable() {
      return getKalturaStatus()
    },
    disableFields() {
      return this.useKaltura && !this.kalturaAvailable
    },
    captions: {
      get() {
        return this.$store.state.currentEditingNode.typeData.captions ?? []
      },
      set(value) {
        this.update("typeData.captions", value)
      },
    },
    defaultCaptionId: {
      get() {
        return this.$store.state.currentEditingNode.typeData.defaultCaptionId ?? null
      },
      set(value) {
        this.update("typeData.defaultCaptionId", value)
      },
    },
    pendingCaptions: {
      get() {
        return this.$store.state.currentEditingNode.typeData.pendingCaptions ?? []
      },
      set(value) {
        this.update("typeData.pendingCaptions", value)
      },
    },
    mediaURL: {
      get() {
        return this.$store.state.currentEditingNode.typeData.mediaURL
      },
      set(value) {
        this.update("typeData.mediaURL", value)
      },
    },
    useCaptions() {
      return this.captions.length > 0
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
  async created() {
    this.languages = await this.getAllLanguages()

    if (this.mediaFormat === "kaltura") {
      this.useKaltura = true
      this.setKalturaVideo(this.kalturaId)
    }
    this.disableKalturaToggle = !this.kalturaAvailable && !this.useKaltura
  },
  methods: {
    ...mapMutations(["setCurrentEditingNodeProperty", "addApiError"]),
    update(property, value) {
      this.setCurrentEditingNodeProperty({ property, value })
    },
    async getAllLanguages() {
      const iso6391LanguageNames = ISO6391.getAllNames()
      const kalturaLanguageNames = getKalturaStatus()
        ? await client.getKalturaAvailableLanguages()
        : []
      const allLanguageNames = Array.from(
        new Set(iso6391LanguageNames.concat(kalturaLanguageNames))
      )
      allLanguageNames.sort()

      return allLanguageNames
    },
    handleUploadChange(state) {
      this.$root.$emit("node-modal::uploading", state)
    },
    handleFormatChange(value) {
      this.useKaltura = value

      if (value) {
        this.update("mediaFormat", "kaltura")
        this.getKalturaCaptions(this.kalturaId)
      } else {
        if (this.kalturaAvailable) {
          this.clearCaptions()
        } // Keep captions if Kaltura not available
        this.updateMediaFormat(this.youtubeId)
      }
    },
    handleKalturaIdEdit() {
      if (this.editingKalturaId) {
        this.setKalturaVideo(this.kalturaId)
      }
      this.editingKalturaId = !this.editingKalturaId
    },
    async setKalturaVideo(kalturaId) {
      if (this.kalturaAvailable) {
        const validKalturaVideo = await client.checkKalturaVideo(kalturaId)
        if (validKalturaVideo) {
          this.update("typeData.kalturaId", kalturaId)
          await this.getKalturaCaptions(kalturaId)
        } else {
          this.addApiError({ error: "Please enter a valid Kaltura video ID." })
        }
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
    handleToggleCaptions() {
      if (this.captions.length === 0) {
        this.addCaption()
      } else {
        this.clearCaptions()
      }
    },
    async getKalturaCaptions(kalturaId) {
      if (kalturaId && this.kalturaAvailable) {
        this.isLoadingKalturaCaptions = true

        const result = await client.getKalturaVideoCaptions(kalturaId)

        this.defaultCaptionId = result.defaultCaptionId
        this.captions = result.captions

        this.isLoadingKalturaCaptions = false
      }
    },
    clearCaptions() {
      this.defaultCaptionId = null
      this.captions = []
    },
    addCaption() {
      this.captions = [
        ...this.captions,
        {
          ...Helpers.deepCopy(defaultCaption),
          id: Helpers.createUUID(),
        },
      ]
      this.$nextTick(() => {
        document
          .getElementById(`caption-${this.captions.length - 1}-container-toggle`)
          .focus()
      })
    },
    removeCaption(index, caption) {
      this.captions.splice(index, 1)
      if (caption.id === this.defaultCaptionId) {
        this.defaultCaptionId = null
      }
    },
    moveFromPending(index, caption) {
      const existingCaptionIndex = this.captions.findIndex(
        cap => cap.id === caption.id
      )

      if (existingCaptionIndex >= 0) {
        const copy = [...this.captions]
        copy[existingCaptionIndex] = caption
        this.captions = copy
      } else {
        this.captions.push(caption)
      }

      this.removePendingCaption(index)
    },
    removePendingCaption(index) {
      this.pendingCaptions.splice(index, 1)
    },
  },
}
</script>

<style lang="scss" scoped>
.no-kaltura-notice {
  text-align: center;
  background: #fff;
  border-radius: 0.5em;
  padding: 1em;
  max-width: 500px;
}
</style>
