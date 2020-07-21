<template>
  <b-container fluid>
    <div v-if="isUploading" class="upload-container">
      <b-row>
        <b-col cols="auto" class="upload-label mr-auto text-muted">
          <p v-if="doneUploading">
            Upload complete. Press the "Submit" button to save your changes
          </p>
          <p v-else>Upload in progress ...</p>
        </b-col>
        <b-col cols="auto">
          <b-button
            v-if="doneUploading"
            size="sm"
            variant="secondary"
            @click="reset"
          >
            OK
          </b-button>
          <b-button v-else size="sm" variant="secondary" @click="reset">
            Cancel
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="progress-wrapper">
          <b-progress
            :value="uploadPercentage"
            :max="100"
            :animated="uploadPercentage < 100"
          ></b-progress>
        </b-col>
      </b-row>
    </div>
    <b-row v-else>
      <b-col class="px-0">
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
      <b-col class="px-0">
        <b-form-input
          name="text-input"
          :placeholder="placeholder"
          :value="value"
          :data-testid="inputTestId"
          :disabled="isUploading"
          required
          @input="$emit('input', $event)"
        />
      </b-col>
    </b-row>
    <b-alert v-if="error" style="margin: 0 -15px;" show variant="danger">
      File upload failed: {{ error.message }}
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
      default: "node-uploadInput",
    },
  },

  data() {
    return {
      uploadPercentage: 0,
      isUploading: false,
      doneUploading: false,
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

      axios
        .post(wpData.upload_url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: progressEvent => {
            this.isUploading = true
            setTimeout(() => {
              this.uploadPercentage = parseInt(
                Math.round((progressEvent.loaded / progressEvent.total) * 100)
              )
              if (this.uploadPercentage === 100) {
                this.doneUploading = true
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
          this.isUploading = false
        })
    },
    reset() {
      this.doneUploading = false
      this.isUploading = false
      this.uploadPercentage = 0
    },
    handleError(error) {
      this.error = error
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

.upload-container {
  padding-left: 9px;
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
