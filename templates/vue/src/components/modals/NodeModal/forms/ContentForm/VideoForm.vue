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
              @isUploading="handleUploadChange"
            />
          </b-form-group>
        </b-overlay>
      </b-col>
    </b-row>
    <b-row class="mb-3">
      <b-col>
        <b-form-checkbox
          v-model="useKaltura"
          switch
          data-qa="use-kaltura-checkbox"
          :value="true"
          :unchecked-value="false"
          style="display:inline-block;"
          @change="handleFormatChange"
        >
          Use Kaltura Player
        </b-form-checkbox>
      </b-col>
    </b-row>
    <b-row v-if="useKaltura" class="mb-3 align-items-center">
      <b-col cols="3">
        Kaltura ID:
      </b-col>
      <b-col>
        <b-input-group>
          <b-form-input
            v-model="kalturaId"
            :disabled="isLoadingKalturaCaptions"
            :readonly="!editingKalturaId"
            class="rounded-left"
            data-qa="node-video-kaltura-id"
            name="text-input"
            :placeholder="
              editingKalturaId ? 'Enter Kaltura video ID' : 'Click Change to edit'
            "
            required
          />
          <b-input-group-append is-text>
            <i id="kaltura-info" class="far fa-question-circle"></i>
            <b-tooltip target="kaltura-info" triggers="hover">
              Video ID can be found in the Kaltura managment console under
              Content->Entries.
            </b-tooltip>
          </b-input-group-append>
          <b-input-group-append>
            <b-button
              variant="primary"
              :disabled="isLoadingKalturaCaptions"
              @click="handleKalturaIdEdit"
            >
              {{ editingKalturaId ? "Submit" : "Change" }}
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-overlay :show="isLoadingKalturaCaptions">
          <b-form-group label="Captions">
            <b-form-checkbox
              v-model="useCaptions"
              switch
              @change="handleToggleCaptions"
            >
              {{ useCaptions ? "On" : "Off" }}
            </b-form-checkbox>
            <template v-if="useCaptions">
              <caption-row
                v-for="(caption, index) in captions"
                :key="caption.id"
                :value="caption"
                :is-removable="captions.length >= 2"
                :is-default="caption.id === defaultCaptionId"
                :languages="useKaltura ? kalturaLanguages : languages"
                @input="captions.splice(index, 1, $event)"
                @setDefault="defaultCaptionId = $event"
                @remove="removeCaption(index, caption)"
              ></caption-row>
              <p class="default-caption-instructions text-muted">
                Select the default caption to display for this video.
              </p>
              <b-button class="mt-3" @click="addCaption">
                <i class="fas fa-plus icon"></i>
                Add caption
              </b-button>
            </template>
            <b-alert v-if="pendingCaptions.length > 0" show variant="danger">
              <caption-row
                v-for="(caption, index) in pendingCaptions"
                :key="caption.id"
                :value="caption"
                is-removable
                add-button
                :languages="useKaltura ? kalturaLanguages : languages"
                @input="pendingCaptions[index] = $event"
                @add="moveFromPending(index, caption)"
                @remove="removePendingCaption(index)"
              ></caption-row>
            </b-alert>
          </b-form-group>
        </b-overlay>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import ISO6391 from "iso-639-1"
import FileUpload from "@/components/modals/common/FileUpload"
import client from "@/services/TapestryAPI"
import Helpers from "@/utils/Helpers"
import { mapMutations } from "vuex"
import CaptionRow from "./CaptionRow"

const defaultCaption = {
  fileUrl: "",
  label: "CC",
  language: "English",
}

export default {
  components: {
    FileUpload,
    CaptionRow,
  },
  data() {
    return {
      kalturaId: this.$store.state.currentEditingNode.typeData.kalturaId,
      useKaltura: false,
      captions: this.$store.state.currentEditingNode.typeData.captions ?? [],
      useCaptions:
        this.$store.state.currentEditingNode.typeData.captions?.length > 0,
      pendingCaptions:
        this.$store.state.currentEditingNode.typeData.pendingCaptions ?? [],
      editingKalturaId: false,
      isLoadingKalturaCaptions: false,
      kalturaLanguages: [],
      languages: [],
    }
  },
  computed: {
    mediaFormat: {
      get() {
        return this.$store.state.currentEditingNode.mediaFormat
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
      this.updateMediaFormat(id)
    },
    captions: {
      handler(value) {
        this.update("typeData.captions", value)
      },
      deep: true,
    },
    pendingCaptions: {
      handler(value) {
        this.update("typeData.pendingCaptions", value)
      },
      deep: true,
    },
  },
  async created() {
    const bcpLanguageNames = ISO6391.getAllNames()
    bcpLanguageNames.sort()
    this.languages = bcpLanguageNames

    this.kalturaLanguages = await client.getKalturaAvailableLanguages()

    if (this.mediaFormat === "kaltura") {
      this.useKaltura = true
      this.setKalturaVideo(this.kalturaId)
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
    handleFormatChange() {
      // If Kaltura is checked or unchecked, the mediaURL should be cleared as it depends on the Kaltura ID
      this.update("typeData.mediaURL", "")
      this.clearCaptions()

      if (this.useKaltura) {
        this.update("mediaFormat", "kaltura")
        this.getKalturaCaptions(this.kalturaId)
      } else {
        this.updateMediaFormat(this.youtubeId)
      }
    },
    handleToggleCaptions() {
      if (this.captions.length === 0) {
        this.addCaption()
      } else {
        this.clearCaptions()
      }
    },
    handleKalturaIdEdit() {
      if (this.editingKalturaId) {
        this.setKalturaVideo(this.kalturaId)
      }
      this.editingKalturaId = !this.editingKalturaId
    },
    async setKalturaVideo(kalturaId) {
      const validKalturaVideo = await client.checkKalturaVideo(kalturaId)
      if (validKalturaVideo) {
        this.update("typeData.kalturaId", kalturaId)
        await this.getKalturaCaptions(kalturaId)
      } else {
        this.addApiError({ error: "Please enter a valid Kaltura video ID." })
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
    async getKalturaCaptions(kalturaId) {
      if (kalturaId) {
        this.isLoadingKalturaCaptions = true

        const result = await client.getKalturaVideoCaptions(kalturaId)

        this.defaultCaptionId = result.defaultCaptionId
        this.captions = result.captions
        this.useCaptions = result.captions.length > 0

        this.isLoadingKalturaCaptions = false
      }
    },
    clearCaptions() {
      this.captions = []
      this.useCaptions = false
      this.defaultCaptionId = null
    },
    addCaption() {
      this.captions = [
        ...this.captions,
        {
          ...Helpers.deepCopy(defaultCaption),
          id: Helpers.createUUID(),
        },
      ]
    },
    removeCaption(index, caption) {
      this.captions = this.captions.filter((c, i) => i != index)
      if (caption.id === this.defaultCaptionId) {
        this.defaultCaptionId = null
      }
    },
    moveFromPending(index, caption) {
      const existingCaptionIndex = this.captions.findIndex(
        cap => cap.id === caption.id
      )
      if (existingCaptionIndex >= 0) {
        // TODO: To investigate - Vue state isn't updating
        this.$set(this.captions, existingCaptionIndex, caption)
      } else {
        this.captions = [...this.captions, caption]
      }

      this.removePendingCaption(index)
    },
    removePendingCaption(index) {
      this.pendingCaptions = this.pendingCaptions.filter((c, i) => i != index)
    },
  },
}
</script>

<style lang="scss" scoped>
.default-caption-instructions {
  margin-left: 17px;
  margin-bottom: 0;

  &::before {
    font-weight: bold;
    content: "↑ ";
  }
}
</style>
