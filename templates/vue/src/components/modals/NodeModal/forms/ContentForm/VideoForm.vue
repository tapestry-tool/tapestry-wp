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
              <b-input-group
                v-for="caption in captions"
                :key="caption.id"
                class="caption-container mt-2"
              >
                <b-input-group-prepend is-text>
                  <b-form-radio
                    v-model="defaultCaptionId"
                    name="default-caption"
                    :value="caption.id"
                  ></b-form-radio>
                </b-input-group-prepend>
                <b-form-input v-model="caption.label" placeholder="Label" />
                <b-form-select
                  v-model="caption.language"
                  :options="useKaltura ? kalturaLanguages : languages"
                ></b-form-select>
                <file-upload
                  v-model="caption.fileUrl"
                  file-types=".vtt"
                  compact-mode
                  :is-image="false"
                  :file-upload-id="`file-upload-input-${caption.id}`"
                />
                <b-input-group-append>
                  <b-button
                    :variant="captions.length < 2 ? 'secondary' : 'danger'"
                    :disabled="captions.length < 2"
                    @click="removeCaption(caption.id)"
                  >
                    X
                  </b-button>
                </b-input-group-append>
              </b-input-group>
              <p class="default-caption-instructions text-muted">
                Select the default caption to display for this video.
              </p>
              <b-button class="mt-3" @click="addCaption">
                <i class="fas fa-plus icon"></i>
                Add caption
              </b-button>
            </template>
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

const defaultCaption = {
  fileUrl: "",
  label: "CC",
  language: "English",
}

export default {
  components: {
    FileUpload,
  },
  data() {
    return {
      kalturaId: this.$store.state.currentEditingNode.typeData.kalturaId,
      useKaltura: false,
      useCaptions:
        this.$store.state.currentEditingNode.typeData.captions?.length > 0,
      captions: this.$store.state.currentEditingNode.typeData.captions ?? [],
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
    removeCaption(captionId) {
      this.captions = this.captions.filter(caption => caption.id != captionId)
      if (captionId === this.defaultCaptionId) {
        this.defaultCaptionId = null
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.caption-container {
  background-color: white;
}

.default-caption-instructions {
  margin-left: 17px;
  margin-bottom: 0;

  &::before {
    font-weight: bold;
    content: "↑ ";
  }
}
</style>
