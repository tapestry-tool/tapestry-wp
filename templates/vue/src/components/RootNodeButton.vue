<template>
  <div id="root-node-button">
    <div data-testid="root-node-button" @click="addRootNode">
      <i class="fas fa-plus-circle fa-5x"></i>
      <div>Add Root Node</div>
    </div>
    <p>Or</p>
    <b-button class="import-button" @click="openFileBrowser">
      Import a Tapestry
    </b-button>
    <div v-if="error" style="margin-top: 16px;">
      {{ error.message }}
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
import { names } from "@/config/routes"
import client from "@/services/TapestryAPI"

export default {
  name: "root-node-button",
  data() {
    return {
      error: null,
      isDragover: false,
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
      const reader = new FileReader()
      reader.onload = e => {
        client
          .importTapestry(JSON.parse(e.target.result))
          .then(() => location.reload()) // TODO: Change this so a refresh isn't required
          .catch(err => (this.error = err))
      }
      reader.readAsText(file)
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
</style>
