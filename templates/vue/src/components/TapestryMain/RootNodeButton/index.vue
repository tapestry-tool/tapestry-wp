<template>
  <div id="root-node-button">
    <import-changelog :changes="changes" />
    <div data-qa="root-node-button" @click="addRootNode">
      <i class="fas fa-plus-circle fa-5x"></i>
      <div>Add Root Node</div>
    </div>
    <p>Or</p>
    <div class="d-flex">
      <b-button class="import-button mx-1" @click="openFileBrowser">
        <b-spinner v-if="isImporting"></b-spinner>
        <div v-else>
          Import a Tapestry from JSON
        </div>
      </b-button>
      <b-button class="import-button mx-1" @click="openZipFileBrowser">
        <b-spinner v-if="isImporting"></b-spinner>
        <div v-else>
          Import a Tapestry from ZIP
        </div>
      </b-button>
    </div>
    <div v-if="error" style="margin-top: 16px;">
      {{ error.message }}
      <br />
      Please try with another file.
    </div>
    <input
      ref="fileInput"
      data-qa="import-file-input"
      type="file"
      style="display: none;"
      @change="handleFileChange"
    />
    <input
      ref="zipFileInput"
      data-qa="import-zip-file-input"
      type="file"
      style="display: none;"
      @change="handleZipFileChange"
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
import ImportChangelog from "./ImportChangelog"
import { data as wpData } from "@/services/wp"

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
      changes: {
        noChange: true,
        permissions: new Set(),
      },
    }
  },
  methods: {
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
    openZipFileBrowser() {
      this.$refs.zipFileInput.click()
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
      if (!file.name.endsWith("json")) {
        this.error = {
          message: "Please upload a JSON file.",
        }
      } else {
        this.importTapestry(file)
      }
    },
    handleFileChange() {
      const file = this.$refs.fileInput.files[0]
      this.importTapestry(file)
    },
    handleZipFileChange() {
      const file = this.$refs.zipFileInput.files[0]
      this.importTapestryFromZip(file)
    },
    importTapestry(file) {
      const reader = new FileReader()
      reader.onload = async e => {
        this.error = ""

        this.isImporting = true
        let upload
        try {
          upload = JSON.parse(e.target.result)
          this.validateTapestryJSON(upload)
        } catch (err) {
          this.error = err
          this.isImporting = false
          return
        }
        if (!(upload["site-url"] == wpData.wpUrl)) {
          await this.prepareImport(upload)
        }
        client
          .importTapestry(upload)
          .then(() => {
            this.isImporting = false
            this.$bvModal.show("import-changelog")
          }) // TODO: Change this so a refresh isn't required
          .catch(err => {
            this.error = err
          })
      }
      reader.readAsText(file)
    },
    importTapestryFromZip(zipFile) {
      this.isImporting = true
      client
        .importTapestryFromZip(zipFile)
        .then(response => {
          console.log(response)
          this.$bvModal.show("import-changelog")
        })
        .catch(err => {
          this.error = err
        })
        .finally(() => {
          this.isImporting = false
        })
    },
    filterImportedPerms(permissions, wp_roles) {
      // TODO: this will need to be moved to the server side because the zip is unzipped there
      let filteredPerms = permissions
      filteredPerms = Object.keys(permissions)
        // only keep roles that exist in the current site
        .filter(key => wp_roles.has(key))
        // create new permissiones object with filtered roles
        .reduce((obj, key) => {
          return {
            ...obj,
            [key]: permissions[key],
          }
        }, {})
      // if permissions modified, add the role to changes
      for (let key in permissions) {
        if (!Object.keys(filteredPerms).includes(key)) {
          this.changes.permissions.add(key)
          this.changes.noChange = false
        }
      }
      return filteredPerms
    },
    async prepareImport(data) {
      let wp_roles = await client.getAllRoles()
      for (let node of data.nodes) {
        node.permissions = this.filterImportedPerms(node.permissions, wp_roles)
      }
      if (data.settings) {
        data.settings.defaultPermissions = this.filterImportedPerms(
          data.settings.defaultPermissions,
          wp_roles
        )
      }
    },
    validateTapestryJSON(upload) {
      const properties = ["nodes", "links", "site-url"]
      properties.forEach(property => {
        if (!upload.hasOwnProperty(property)) {
          throw new Error(`Invalid Tapestry JSON: Missing property ${property}`)
        }
      })
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
