<template>
  <div id="root-node-button">
    <import-changelog
      :changes="changes"
      :warnings="warnings"
      :exportWarnings="exportWarnings"
    />
    <div data-qa="root-node-button" @click="addRootNode">
      <i class="fas fa-plus-circle fa-5x"></i>
      <div>Add Root Node</div>
    </div>
    <p>Or</p>
    <b-button class="import-button mx-1" @click="openFileBrowser">
      <b-spinner v-if="isImporting"></b-spinner>
      <div v-else>
        Import a Tapestry
      </div>
    </b-button>
    <div v-if="error" style="margin-top: 16px;">
      {{ error.message }}
      <br />
      Please try with another file.
    </div>
    <div v-if="isImporting" style="margin-top: 16px;">
      {{ importStatusMessage }}
    </div>
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
  </div>
</template>

<script>
import { names } from "@/config/routes"
import client from "@/services/TapestryAPI"
import WordpressApi from "@/services/WordpressApi"
import ImportChangelog from "./ImportChangelog"
import { mapMutations } from "vuex"

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
      importStatusMessage: "",
      importStatusRefresh: null,
      changes: {
        noChange: true,
        permissions: new Set(),
      },
      warnings: {},
      exportWarnings: false,
    }
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
        this.error = ""

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
      this.error = ""
      this.isImporting = true
      this.importStatusMessage = "Uploading file..."
      this.importStatusRefresh = setInterval(() => {
        client
          .getImportStatus()
          .then(status => {
            if (status.message) {
              this.importStatusMessage = status.message + "..."
            }
            if (!status.inProgress) {
              this.importStatusMessage = "Import is not in progress"
            }
          })
          .catch(err => {
            this.addApiError(err)
          })
      }, 5000)

      client
        .importTapestryFromZip(zipFile)
        .then(response => {
          clearInterval(this.importStatusRefresh)
          if (response) {
            this.changes.permissions = new Set(response.changes.permissions)
            this.changes.noChange = response.changes.noChange
            this.warnings = response.warnings
            this.exportWarnings = response.exportWarnings

            return response.rebuildH5PCache
          } else {
            return false
          }
        })
        .catch(err => {
          clearInterval(this.importStatusRefresh)
          this.error = err.response.data
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
        .then(() => {
          if (!this.error) {
            this.$bvModal.show("import-changelog")
          }
        })
        .finally(() => {
          this.importStatusMessage = ""
          this.isImporting = false
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

  &:hover {
    background-color: var(--highlight-color);
  }
}

.dropbox {
  width: 100%;
  height: 85%;
  border: 3px dashed black;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translateX(-50%);
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
