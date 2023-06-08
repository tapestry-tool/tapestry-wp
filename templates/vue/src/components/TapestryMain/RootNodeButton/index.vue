<template>
  <div id="root-node-button">
    <import-changelog
      :changes="changes"
      :warnings="warnings"
      :exportWarnings="exportWarnings"
    />
    <template v-if="!isImporting">
      <div data-qa="root-node-button" @click="addRootNode">
        <i class="fas fa-plus-circle fa-5x"></i>
        <div>Add Root Node</div>
      </div>
      <p>Or</p>
    </template>
    <b-button
      class="import-button mx-1 mb-4"
      :disabled="isImporting"
      @click="openFileBrowser"
    >
      <template v-if="isImporting">
        <b-spinner></b-spinner>
        Import in progress
      </template>
      <div v-else>
        Import a Tapestry
      </div>
    </b-button>
    <b-alert v-if="error" style="margin-top: 16px;" variant="warning" show>
      {{ error.message }}
    </b-alert>
    <b-card
      v-if="isImporting && showImportProgress"
      style="margin-top: 16px; min-width: 100%;"
    >
      <h5>Step 1 - Upload file</h5>
      <span v-if="isUploading && uploadBytesTotal > 100">
        Uploading
        <span v-if="uploadBytesTotal / uploadBytesProcessed >= 4">
          {{ importFileProgressLabel }}
        </span>
        <a href="javascript:void(0)" class="ml-2" @click="cancelUpload">Cancel</a>
      </span>
      <b-progress
        :max="uploadBytesTotal"
        class="my-2"
        height="2rem"
        :variant="uploadBytesTotal === uploadBytesProcessed ? 'success' : 'primary'"
      >
        <b-progress-bar :value="uploadBytesProcessed">
          <span v-if="uploadBytesTotal / uploadBytesProcessed < 4 && isUploading">
            {{ importFileProgressLabel }}
          </span>
        </b-progress-bar>
      </b-progress>
      <h5>Step 2 - Import</h5>
      <span v-if="isUploading">Waiting for step 1 to complete</span>
      <span v-else>{{ importStatusMessage }}</span>
      <b-progress
        :value="isUploading ? 0 : 1"
        :max="1"
        height="2rem"
        class="my-2"
        animated
      ></b-progress>
    </b-card>
    <template v-else>
      <input
        ref="fileInput"
        data-qa="import-file-input"
        type="file"
        style="display: none;"
        @change="handleFileChange"
      />
      <div
        data-qa="import-file-drop"
        :class="['dropbox', { 'drag-over': isDragover }]"
        @dragenter="handleDragStart"
        @dragover="handleDragStart"
        @dragleave="handleDragEnd"
        @dragend="handleDragEnd"
        @drop="handleDragDrop"
      ></div>
    </template>
  </div>
</template>

<script>
import axios from "axios"
import { names } from "@/config/routes"
import client from "@/services/TapestryAPI"
import WordpressApi from "@/services/WordpressApi"
import ImportChangelog from "./ImportChangelog"
import { mapMutations, mapState } from "vuex"
import Helpers from "@/utils/Helpers"

export default {
  name: "root-node-button",
  components: {
    ImportChangelog,
  },
  data() {
    return {
      error: null,
      isDragover: false,
      isImporting: false,
      showImportProgress: false,
      uploadBytesTotal: 1,
      uploadBytesProcessed: 0,
      importStatusMessage: "",
      changes: {
        noChange: true,
        permissions: new Set(),
      },
      warnings: {},
      exportWarnings: false,
      cancelTokenSource: null,
    }
  },
  computed: {
    ...mapState(["importProgress"]),
    importFileProgressLabel() {
      const uploaded = Helpers.formatFileSize(this.uploadBytesProcessed)
      const total = Helpers.formatFileSize(this.uploadBytesTotal)
      const perc =
        Math.round((10000 * this.uploadBytesProcessed) / this.uploadBytesTotal) / 100
      return `${uploaded} / ${total} (${perc}%)`
    },
    isUploading() {
      return this.uploadBytesTotal / this.uploadBytesProcessed !== 1
    },
  },
  watch: {
    importProgress(progressEvent) {
      this.uploadBytesProcessed = progressEvent.loaded
      this.uploadBytesTotal = progressEvent.total
    },
  },
  methods: {
    ...mapMutations(["addApiError"]),
    addRootNode() {
      this.$router.push({
        name: names.MODAL,
        params: {
          nodeId: 0,
          type: "add",
          tab: "content",
        },
        query: this.$route.query,
      })
    },
    openFileBrowser() {
      this.$refs.fileInput.click()
    },
    handleDragStart(evt) {
      evt.preventDefault()
      this.error = null
      this.isDragover = true
    },
    handleDragEnd(evt) {
      evt.preventDefault()
      this.isDragover = false
    },
    handleDragDrop(evt) {
      this.isDragover = false
      evt.preventDefault()
      evt.stopPropagation()
      const file = evt.dataTransfer.files[0]
      this.importTapestryFromFile(file)
    },
    handleFileChange() {
      const file = this.$refs.fileInput.files[0]
      this.importTapestryFromFile(file)
    },
    importTapestryFromFile(file) {
      if (!file) return

      switch (this.getFileExtension(file.name)) {
        case "json":
          this.error = null
          this.importTapestry(file)
          break
        case "zip":
          this.error = null
          this.showImportProgress = true
          this.importTapestryFromZip(file)
          break
        default:
          this.error = {
            message: "Please upload a JSON file or a ZIP file.",
          }
      }
    },
    importTapestry(file) {
      const reader = new FileReader()
      reader.onload = async e => {
        this.error = null

        this.isImporting = true
        this.importStatusMessage = ""
        const upload = e.target.result
        client
          .importTapestry(upload)
          .then(response => {
            if (response) {
              this.changes.permissions = new Set(response.changes.permissions)
              this.changes.noChange = response.changes.noChange
              this.$bvModal.show("import-changelog")
            }
          }) // TODO: Change this so a refresh isn't required
          .catch(err => {
            this.error = err
          })
          .finally(() => {
            this.isImporting = false
          })
      }
      reader.readAsText(file)
    },
    importTapestryFromZip(zipFile) {
      this.error = null
      this.isImporting = true
      this.importStatusMessage = "Getting ready to import"

      client
        .clearImportStatus()
        .catch(err => {
          this.error = err.response.data
        })
        .finally(() => {
          this.updateImportStatus()
        })

      this.cancelTokenSource = axios.CancelToken.source()

      client
        .importTapestryFromZip(zipFile, this.cancelTokenSource)
        .then(response => {
          let shouldRebuild = false
          if (response) {
            this.changes.permissions = new Set(response.changes.permissions)
            this.changes.noChange = response.changes.noChange
            this.warnings = response.warnings
            this.exportWarnings = response.exportWarnings

            shouldRebuild = response.rebuildH5PCache
          } else {
            this.error = {
              message: "An error occurred while uploading file.",
            }
            shouldRebuild = false
          }
          return shouldRebuild
        })
        .catch(err => {
          if (err.response) {
            this.error = err.response.data
          } else {
            this.error = {
              message: err.message,
            }
          }
        })
        .then(shouldRebuild => {
          if (shouldRebuild) {
            // The h5pMeta.details field is not generated for imported H5Ps
            // If any H5Ps were added during import, we need to rebuild the H5P cache
            this.importStatusMessage =
              "Rebuilding H5P cache... Please do not close this tab."
            return WordpressApi.rebuildAllH5PCache()
          }
        })
        .catch(err => {
          this.error = err
        })
        .finally(() => {
          if (!this.error?.message) {
            this.$bvModal.show("import-changelog")
          }
          this.importStatusMessage = ""
          this.showImportProgress = false
          this.isImporting = false
        })
    },
    cancelUpload() {
      this.cancelTokenSource.cancel("You cancelled the upload.")
    },
    updateImportStatus() {
      client
        .getImportStatus()
        .then(status => {
          if (!this.isUploading && status.inProgress && status.message) {
            this.importStatusMessage =
              status.message + "... Please do not close this tab."
          }
        })
        .catch(err => {
          this.addApiError(err)
        })
        .finally(() => {
          if (this.isImporting) {
            setTimeout(() => {
              this.updateImportStatus()
            }, 2000)
          }
        })
    },
    getFileExtension(fileName) {
      // Get extension from file name
      // See https://stackoverflow.com/a/12900504
      return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2)
    },
  },
}
</script>

<style lang="scss" scoped>
#root-node-button {
  padding-top: 40px;
  display: flex;
  align-items: center;
  flex-direction: column;
  z-index: 0;

  > div:first-child {
    display: inline-block;
    margin-top: 20vh;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 10;

    &:hover,
    &:active {
      transform: scale(1.1);
      color: var(--highlight-color);
    }

    > div {
      text-align: center;
      font-size: 1.5em;
      padding-top: 10px;
    }
  }

  > p {
    display: block;
    margin: 12px;
    margin-left: 0;
    margin-right: 0;
  }
}

.import-button {
  background-color: #2c3e50;
  border: none;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  column-gap: 10px;

  &:hover {
    background-color: var(--highlight-color);
  }
}

.dropbox {
  width: 100%;
  height: calc(100% - 40px);
  border: 3px dashed black;
  position: absolute;
  top: 40px;
  left: 10px;
  opacity: 0;
  z-index: 0;
  bottom: 0;

  &.drag-over {
    opacity: 1;
  }
}

.spinner {
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
