<template>
  <div id="root-node-button">
    <import-changelog :changes="changes" />
    <div data-testid="root-node-button" @click="$emit('click')">
      <i class="fas fa-plus-circle fa-5x"></i>
      <div>Add Root Node</div>
    </div>
    <p>Or</p>
    <b-button class="import-button" @click="openFileBrowser">
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
    <input
      ref="fileInput"
      type="file"
      style="display: none;"
      @change="handleFileChange"
    />
    <div
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
import client from "@/services/TapestryAPI"
import ImportChangelog from "./ImportChangelog"

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
    showModal() {
      this.$emit("add-root-node")
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
    importTapestry(file) {
      this.isImporting = true
      const reader = new FileReader()
      reader.onload = async e => {
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
    async prepareImport(data) {
      let wp_roles = await client.getAllRoles()
      for (let node of data.nodes) {
        const originalPerms = node.permissions
        node.permissions = Object.keys(node.permissions)
          .filter(key => wp_roles.has(key))
          .reduce((obj, key) => {
            return {
              ...obj,
              [key]: node.permissions[key],
            }
          }, {})
        const keys = Object.keys(node.permissions)
        for (let key in originalPerms) {
          if (!keys.includes(key)) {
            this.changes.permissions.add(key)
          }
        }
        if (node.permissionsOrder) {
          node.permissionsOrder = node.permissionsOrder.filter(role =>
            wp_roles.has(role)
          )
        }
        if (this.changes.permissions.size > 0) {
          this.changes.noChange = false
        }
      }
    },
    validateTapestryJSON(upload) {
      const properties = ["nodes", "links", "groups", "site-url"]
      properties.forEach(property => {
        if (!upload.hasOwnProperty(property)) {
          throw new Error("Invalid Tapestry JSON.")
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
      color: #11a6d8;
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
    background-color: #11a6d8;
  }
}

.dropbox {
  width: 90vw;
  height: 90vh;
  border: 3px dashed black;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  z-index: 0;

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
