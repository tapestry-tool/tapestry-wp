<template>
  <div>
    <mp4-form v-if="mediaFormat === 'mp4'"></mp4-form>
    <youtube-form v-else-if="mediaFormat === 'youtube'"></youtube-form>
    <kaltura-form v-else-if="mediaFormat === 'kaltura'"></kaltura-form>
    <b-row>
      <b-col>
        <b-overlay :show="isLoadingKalturaCaptions">
          <b-form-group label="Captions">
            <b-form-checkbox
              :checked="useCaptions"
              data-qa="node-captions-toggle"
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
                :index="index"
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
  </div>
</template>

<script>
import Mp4Form from "./Mp4Form"
import YoutubeForm from "./YoutubeForm"
import KalturaForm from "./KalturaForm"
import { mapState, mapMutations } from "vuex"
import ISO6391 from "iso-639-1"
import client from "@/services/TapestryAPI"
import Helpers from "@/utils/Helpers"
import CaptionRow from "./CaptionRow"

const defaultCaption = {
  captionUrl: "",
  language: "English",
  label: undefined,
  displayOnPlayer: true,
}

export default {
  components: {
    Mp4Form,
    YoutubeForm,
    KalturaForm,
    CaptionRow,
  },
  data() {
    return {
      useKaltura: false,
      isLoadingKalturaCaptions: false,
      languages: [],
    }
  },
  computed: {
    ...mapState({
      mediaFormat: state => state.currentEditingNode.mediaFormat,
    }),
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
    useCaptions() {
      return this.captions.length > 0
    },
  },
  async created() {
    this.languages = await this.getAllLanguages()
  },
  methods: {
    ...mapMutations(["setCurrentEditingNodeProperty"]),
    update(property, value) {
      this.setCurrentEditingNodeProperty({ property, value })
    },
    async getAllLanguages() {
      const iso6391LanguageNames = ISO6391.getAllNames()
      const kalturaLanguageNames = await client.getKalturaAvailableLanguages()
      const allLanguageNames = Array.from(
        new Set(iso6391LanguageNames.concat(kalturaLanguageNames))
      )
      allLanguageNames.sort()

      return allLanguageNames
    },
    handleToggleCaptions() {
      if (this.captions.length === 0) {
        this.addCaption()
      } else {
        this.clearCaptions()
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
