<template>
  <b-container fluid class="upload-container px-0">
    <b-row v-if="isUploading">
      <b-col cols="auto" class="upload-label mr-auto text-muted">
        <p>Upload in progress ...</p>
      </b-col>
      <b-col cols="auto">
        <b-button size="sm" variant="light" @click="cancelUpload">
          Cancel Upload
        </b-button>
      </b-col>
    </b-row>
    <b-row v-if="isUploading">
      <b-col class="progress-wrapper">
        <b-progress
          data-qa="progress"
          :value="uploadPercentage"
          :max="100"
          :animated="uploadPercentage < 100"
        ></b-progress>
      </b-col>
    </b-row>
    <b-row v-if="!isUploading">
      <b-col v-if="showImagePreview" class="thumbnail-col">
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
      </b-col>
      <b-col>
        <div v-if="showImagePreview && value">
          <h6>Operations:</h6>
          <button class="btn btn-outline-danger btn-sm mb-2" @click="removeImage">
            Remove image
          </button>
          <br />
          <button
            v-if="!changeImage"
            class="btn btn-outline-primary btn-sm"
            @click="changeImage = true"
          >
            Change image
          </button>
          <h6 v-else>Change image:</h6>
        </div>
        <b-row v-if="!showImagePreview || !value || changeImage">
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
            <b-col :class="{ 'pl-0': !showImagePreview }">
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
      </b-col>
    </b-row>
    <b-alert v-if="error" show variant="danger">
      File upload failed: {{ error.message || error.data.message }}
    </b-alert>
    <b-alert v-else-if="!confirmedUpload" show variant="success">
      <b-row>
        <b-col cols="auto" class="upload-label mr-auto text-muted">
          Upload completed successfully. Press the "Submit" button to save your
          changes.
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
  },
  data() {
    return {
      uploadPercentage: 0,
      uploadBarInterval: null,
      uploadSource: null,
      isUploading: false,
      confirmedUpload: true,
      changeImage: false,
      imagePatternId: "",
      error: null,
    }
  },
  created() {
    if (this.showImagePreview) {
      this.imagePatternId =
        "thumbnail-preview-" +
        Math.random()
          .toString(36)
          .substring(9)
    }
  },
  methods: {
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
            this.confirmedUpload = false
            this.$emit("isUploading", this.isUploading)
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
          }
        })
        .catch(err => console.log(err))
    },
    handleError(error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled", error.message)
      } else {
        this.error = error
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.thumbnail-col {
  -ms-flex: 0 0 160px;
  flex: 0 0 160px;
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
