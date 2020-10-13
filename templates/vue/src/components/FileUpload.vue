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
      <b-col class="pr-0">
        <b-form-file
          ref="file"
          name="async-upload"
          class="image-file"
          placeholder="Choose a file or drop it here..."
          drop-placeholder="Drop file here..."
          :disabled="isUploading"
          required
          @dragover.prevent
          @drop.prevent="uploadFile"
          @change="uploadFile"
        ></b-form-file>
      </b-col>
      <b-col sm="1" class="divider">
        <h6 class="text-muted">OR</h6>
      </b-col>
      <b-col class="pl-0">
        <b-form-input
          name="text-input"
          :placeholder="placeholder"
          :value="value"
          :data-qa="inputTestId"
          :disabled="isUploading"
          required
          @input="$emit('input', $event)"
        />
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

export default {
  name: "file-upload",
  props: {
    placeholder: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: false,
    },
    inputTestId: {
      type: String,
      required: false,
      default: "node-upload-input",
    },
  },
  data() {
    return {
      uploadPercentage: 0,
      uploadBarInterval: null,
      uploadSource: null,
      isUploading: false,
      confirmedUpload: true,
      error: null,
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
