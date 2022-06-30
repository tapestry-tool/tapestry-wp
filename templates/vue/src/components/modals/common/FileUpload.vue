<template>
  <b-container fluid class="upload-container px-0">
    <template v-if="isUploading && !compactMode">
      <b-row>
        <b-col cols="auto" class="upload-label mr-auto text-muted">
          <p>Upload in progress ...</p>
        </b-col>
        <b-col cols="auto">
          <b-button size="sm" variant="light" @click="cancelUpload">
            Cancel Upload
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="progress-wrapper">
          <b-progress
            data-qa="progress"
            :value="uploadPercentage"
            :max="100"
            :animated="uploadPercentage < 100"
          ></b-progress>
        </b-col>
      </b-row>
    </template>
    <b-row v-if="!isUploading || compactMode">
      <b-col v-if="showImagePreviewValue" class="thumbnail-col">
        <svg
          width="130"
          height="130"
          class="img-thumbnail"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
          role="img"
          aria-label="Thumbnail placeholder for when no thumbnail is uploaded"
        >
          <rect
            width="100%"
            height="100%"
            :fill="value ? 'url(#' + imagePatternId + ')' : '#868e96'"
          ></rect>
          <defs v-if="value">
            <pattern :id="imagePatternId" width="1" height="1">
              <image
                preserveAspectRatio="xMidYMid slice"
                :href="value"
                x="0"
                y="0"
                width="130"
                height="130"
              />
            </pattern>
          </defs>
          <text v-if="!value" x="50%" y="50%" fill="#dee2e6" dy=".3em" dx="-2em">
            No image
          </text>
        </svg>
        <div v-if="compactMode" class="compact-mode-container">
          <b-button-group
            v-if="(value && !changeImage) || isUploading"
            class="w-100"
          >
            <b-button
              v-if="isUploading"
              size="sm"
              variant="light"
              @click="cancelUpload"
            >
              <i class="fas fa-window-close"></i>
            </b-button>
            <template v-else>
              <b-button variant="danger" size="sm" @click="removeImage">
                <i class="fas fa-trash-alt"></i>
              </b-button>
              <b-button variant="light" size="sm" @click="changeImage = true">
                <i class="fas fa-pencil-alt"></i>
              </b-button>
            </template>
          </b-button-group>
          <b-form-file
            v-if="!value || (changeImage && !isUploading)"
            ref="file"
            name="async-upload"
            class="image-file"
            placeholder="Click to choose a file or drop file here to upload"
            drop-placeholder="Drop file here..."
            :accept="fileTypes"
            :disabled="isUploading"
            required
            data-qa="import-file-input"
            @dragover.prevent
            @drop.prevent="uploadFile"
            @change="uploadFile"
          ></b-form-file>
          <b-progress
            v-if="isUploading"
            data-qa="progress"
            :value="uploadPercentage"
            :max="100"
            :animated="uploadPercentage < 100"
          ></b-progress>
        </div>
      </b-col>
      <b-col>
        <div v-if="!compactMode">
          <div v-if="showImagePreviewValue && value">
            <h6>Operations:</h6>
            <b-button
              class="mb-2"
              variant="outline-danger"
              size="sm"
              @click="removeImage"
            >
              Remove image
            </b-button>
            <br />
            <b-button
              v-if="!changeImage"
              variant="outline-primary"
              size="sm"
              @click="changeImage = true"
            >
              Change image
            </b-button>
            <h6 v-else>Change image:</h6>
          </div>
          <b-row v-if="!showImagePreviewValue || !value || changeImage">
            <b-col :class="{ 'pr-0': showUrlUpload }">
              <b-form-file
                ref="file"
                name="async-upload"
                class="image-file"
                placeholder="Choose a file or drop it here..."
                drop-placeholder="Drop file here..."
                :accept="fileTypes"
                :disabled="isUploading"
                required
                data-qa="import-file-input"
                @dragover.prevent
                @drop.prevent="uploadFile"
                @change="uploadFile"
              ></b-form-file>
            </b-col>
            <template v-if="showUrlUpload">
              <b-col cols="1" class="divider">
                <h6 class="text-muted">OR</h6>
              </b-col>
              <b-col :class="{ 'pl-0': !showImagePreviewValue }">
                <b-form-input
                  name="text-input"
                  :placeholder="placeholder"
                  :value="value"
                  :data-qa="inputTestId"
                  :data-testid="inputTestId"
                  :disabled="isUploading"
                  required
                  @input="$emit('input', $event)"
                />
              </b-col>
            </template>
          </b-row>
        </div>
      </b-col>
    </b-row>
    <b-alert v-if="!compactMode && !confirmedUpload" show variant="success">
      <b-row>
        <b-col cols="auto" class="upload-label mr-auto text-muted">
          Upload completed successfully. Make sure to publish / save to keep this
          image.
        </b-col>
        <b-col cols="auto">
          <b-button size="sm" variant="secondary" @click="confirmUpload">
            OK
          </b-button>
        </b-col>
      </b-row>
    </b-alert>
  </b-container>
</template>

<script>
import axios from "axios"
import { mapMutations } from "vuex"
import { data as wpData } from "@/services/wp"

export default {
  name: "file-upload",
  props: {
    placeholder: {
      type: String,
      required: false,
      default: "",
    },
    value: {
      type: String,
      required: false,
      default: "",
    },
    inputTestId: {
      type: String,
      required: false,
      default: "node-upload-input",
    },
    showUrlUpload: {
      type: Boolean,
      required: false,
      default: true,
    },
    // See https://bootstrap-vue.org/docs/components/form-file#limiting-to-certain-file-types
    fileTypes: {
      type: String,
      required: false,
      default: null,
    },
    showImagePreview: {
      type: Boolean,
      required: false,
      default: false,
    },
    thumbnailType: {
      type: String,
      required: false,
      default: "",
    },
    compactMode: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      uploadPercentage: 0,
      uploadBarInterval: null,
      uploadSource: null,
      isUploading: false,
      confirmedUpload: true,
      changeImage: false,
      error: null,
    }
  },
  computed: {
    showImagePreviewValue() {
      // NOTE: compactMode cannot work without showing the image preview
      return this.compactMode || this.showImagePreview
    },
    imagePatternId() {
      return this.showImagePreviewValue
        ? "thumbnail-preview-" +
            Math.random()
              .toString(36)
              .substring(9)
        : ""
    },
  },
  methods: {
    ...mapMutations(["addApiError"]),
    uploadFile(event) {
      const formData = new FormData()
      formData.append("action", "upload-attachment")
      formData.append(
        "async-upload",
        event.dataTransfer && event.dataTransfer.files
          ? event.dataTransfer.files[0]
          : event.target.files[0]
      )
      formData.append(
        "name",
        event.dataTransfer && event.dataTransfer.files
          ? event.dataTransfer.files[0]
          : event.target.files[0].name
      )
      formData.append("_wpnonce", wpData.file_upload_nonce)

      this.error = null
      this.confirmedUpload = true

      let CancelToken = axios.CancelToken
      this.uploadSource = CancelToken.source()
      axios
        .post(wpData.upload_url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          cancelToken: this.uploadSource.token,
          onUploadProgress: progressEvent => {
            this.isUploading = true
            this.$emit("isUploading", this.isUploading)
            setTimeout(() => {
              this.uploadPercentage = parseInt(
                Math.round((progressEvent.loaded / progressEvent.total) * 95)
              )
              if (this.uploadPercentage == 95) {
                this.uploadBarInterval = setInterval(() => {
                  if (this.uploadPercentage < 99) {
                    this.uploadPercentage++
                  }
                }, 500)
              }
            }, 1000)
          },
        })
        .then(response => {
          setTimeout(() => {
            if (response.data.success) {
              this.$emit("input", response.data.data.url)
              if (this.thumbnailType) {
                this.$root.$emit("fileID", {
                  thumbnailType: this.thumbnailType,
                  data: response.data.data.id,
                })
              }
            } else {
              this.handleError(response.data)
            }
          }, 800)
        })
        .catch(response => this.handleError(response))
        .finally(() => {
          if (this.isUploading) {
            this.isUploading = false
            this.changeImage = false
            if (!this.compactMode) {
              this.confirmedUpload = false
            }
            setTimeout(() => {
              this.$emit("isUploading", this.isUploading)
            }, 1200)
          }
          clearInterval(this.uploadBarInterval)
        })
    },
    cancelUpload() {
      this.uploadPercentage = 0
      this.isUploading = false
      this.$emit("isUploading", false)
      if (this.uploadSource) {
        this.uploadSource.cancel()
        this.confirmedUpload = true
      }
    },
    confirmUpload() {
      this.confirmedUpload = true
    },
    removeImage(event) {
      event.preventDefault()
      this.$bvModal
        .msgBoxConfirm("The currently uploaded image will be removed.", {
          modalClass: "node-modal-confirmation",
          title: "Are you sure you want to continue?",
          okTitle: "Yes, Remove!",
          okVariant: "danger",
        })
        .then(close => {
          if (close) {
            this.$emit("input", null)
            this.$root.$emit("remove-thumbnail", this.thumbnailType)
          }
        })
        .catch(err => console.log(err))
    },
    handleError(error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled", error.message)
      } else {
        const errMsg = error.message || error.data.message
        this.addApiError({ error: `Unable to upload file: ${errMsg}` })
      }
    },
  },
}
</script>
<style lang="scss">
.thumbnail-col {
  .custom-file-label {
    display: flex;
    height: 100%;
    max-height: 100%;
    overflow: hidden;
    padding: 0 5px;
    bottom: auto;
    align-items: center;
    text-align: center;
    font-size: 0.9em;
    font-weight: bold;
    color: #fff;
    background: #393c3ebd;
    border: none;
    white-space: pre-wrap;

    &::after {
      display: none;
    }
  }
}
</style>
<style lang="scss" scoped>
.compact-mode-container {
  position: absolute;
  width: 120px;
  left: 20px;
  bottom: 4px;
}

.thumbnail-col {
  -ms-flex: 0 0 160px;
  flex: 0 0 160px;

  .b-form-file {
    height: 120px;
    display: block;
  }
}

.image-file {
  overflow: hidden;
  text-overflow: ellipsis;
}

.divider {
  text-align: center;
  vertical-align: center;
  padding: 10px;
}

.upload-label {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.9em;
  padding-top: 0.8%;
  p {
    padding-left: 0;
  }
}
</style>
