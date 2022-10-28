<template>
  <div>
    <tapestry-toolbar-button
      :id="`background-button-${node.id}`"
      horizontal
      tooltip="Change Background"
      :active="active"
      @click="toggleToolbar"
    >
      <node-thumbnail-preview
        v-if="node.imageURL"
        :value="node.imageURL"
      ></node-thumbnail-preview>
      <div v-else class="circle" :style="{ background: node.backgroundColor }"></div>
    </tapestry-toolbar-button>
    <tapestry-context-toolbar
      v-model="showBackgroundToolbar"
      :target="`background-button-${node.id}`"
      placement="bottom"
    >
      <tapestry-toolbar-button
        v-if="node.imageURL"
        :id="`background-image-remove-${node.id}`"
        horizontal
        tooltip="Remove Background Image"
        tooltip-placement="bottom"
        :active="activeButton === 'remove'"
        @click="removeThumbnail"
      >
        <i class="fas fa-times-circle fa-lg"></i>
      </tapestry-toolbar-button>
      <tapestry-toolbar-button
        :id="`background-image-button-${node.id}`"
        horizontal
        :tooltip="
          node.imageURL
            ? 'Change Background Image By Clicking / Drag & Drop'
            : 'Add Background Image By Clicking / Drag & Drop'
        "
        tooltip-placement="bottom"
        :active="activeButton === 'image'"
        @click="openFileBrowser"
      >
        <b-spinner
          v-if="isImageUploading"
          style="width: 24px; height: 24px;"
        ></b-spinner>
        <i v-else class="fas fa-image fa-lg"></i>
      </tapestry-toolbar-button>
      <v-swatches
        :value="node.backgroundColor"
        :swatches="swatches"
        show-fallback
        show-border
        shapes="circles"
        swatch-size="30"
        :wrapper-style="{ zIndex: 1000 }"
        fallback-input-type="color"
        row-length="8"
        popover-x="right"
        popover-y="top"
        class="swatch"
        @input="handleColorInput"
        @open="activeButton = 'color'"
        @close="handleClose('color')"
      >
        <tapestry-toolbar-button
          :id="`background-color-button-${node.id}`"
          slot="trigger"
          horizontal
          tooltip="Change Background Color"
          tooltip-placement="bottom"
          :active="activeButton === 'color'"
        >
          <div class="circle" :style="{ background: node.backgroundColor }"></div>
        </tapestry-toolbar-button>
      </v-swatches>
    </tapestry-context-toolbar>
    <input
      ref="imageUpload"
      type="file"
      accept="image/*"
      style="display: none;"
      @change="handleImageUpload"
    />
  </div>
</template>

<script>
import axios from "axios"
import VSwatches from "vue-swatches"
import TapestryContextToolbar from "../TapestryContextToolbar"
import TapestryToolbarButton from "../common/TapestryToolbarButton"
import NodeThumbnailPreview from "./NodeThumbnailPreview"
import { swatches } from "@/utils/constants"
import { mapActions, mapMutations, mapState } from "vuex"
import { data as wpData } from "@/services/wp"

export default {
  name: "node-background-button",
  components: {
    TapestryContextToolbar,
    TapestryToolbarButton,
    NodeThumbnailPreview,
    VSwatches,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      swatches: swatches,

      activeButton: null,
      isImageUploading: false,
      showBackgroundToolbar: false,
    }
  },
  computed: {
    ...mapState(["fullscreenDropzone"]),
    dropzoneFile() {
      return this.fullscreenDropzone.file
    },
  },
  watch: {
    active: {
      handler(active) {
        if (active) {
          window.addEventListener("dragenter", this.handleDragEnter)
        } else {
          this.showBackgroundToolbar = false
          this.activeButton = null

          window.removeEventListener("dragenter", this.handleDragEnter)
        }
      },
      immediate: true,
    },
    dropzoneFile(file) {
      if (this.active && file) {
        if (file.type?.startsWith("image/")) {
          this.uploadImage(file)
        } else {
          this.addApiError({ error: "Unable to upload file: File is not an image." })
        }
      }
    },
  },
  beforeDestroy() {
    window.removeEventListener("dragenter", this.handleDragEnter)
  },
  methods: {
    ...mapMutations(["setFullscreenDropzone", "addApiError"]),
    ...mapActions(["updateNode"]),
    toggleToolbar() {
      this.showBackgroundToolbar = !this.showBackgroundToolbar
      this.$emit(this.showBackgroundToolbar ? "show" : "hide")
    },
    handleColorInput(backgroundColor) {
      this.updateNode({
        id: this.node.id,
        newNode: {
          backgroundColor: backgroundColor,
        },
      }).then(() => {
        this.$root.$emit("minimap::redraw")
      })
    },
    handleClose(button) {
      if (this.activeButton === button) {
        this.activeButton = null
      }
    },
    removeThumbnail() {
      this.activeButton = "remove"
      this.updateNode({
        id: this.node.id,
        newNode: {
          imageURL: "",
          thumbnailFileId: "",
        },
      }).then(() => {
        this.activeButton = null
      })
    },
    handleImageUpload() {
      const file = this.$refs.imageUpload.files[0]
      this.uploadImage(file)
    },
    handleUploadError(error) {
      const errMsg = error.message || error.data.message
      this.addApiError({ error: `Unable to upload file: ${errMsg}` })
    },
    openFileBrowser() {
      if (this.isImageUploading) {
        return
      }
      this.activeButton = "image"
      this.$refs.imageUpload.click()
    },
    handleDragEnter(evt) {
      evt.preventDefault()
      if (!this.fullscreenDropzone.active) {
        this.setFullscreenDropzone({ active: true, file: null })
      }
    },
    uploadImage(file) {
      const formData = new FormData()
      formData.append("action", "upload-attachment")
      formData.append("async-upload", file)
      formData.append("name", file.name)
      formData.append("_wpnonce", wpData.file_upload_nonce)

      this.error = null
      this.confirmedUpload = true

      this.isImageUploading = true
      axios
        .post(wpData.upload_url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(response => {
          if (response.data.success) {
            const { id, url } = response.data.data
            this.updateNode({
              id: this.node.id,
              newNode: {
                imageURL: url,
                thumbnailFileId: id,
              },
            })
          } else {
            this.handleError(response.data)
          }
        })
        .catch(response => this.handleError(response))
        .finally(() => {
          this.isImageUploading = false
          this.activeButton = null
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.circle {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
}
</style>
