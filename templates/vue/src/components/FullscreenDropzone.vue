<template>
  <div
    v-show="fullscreenDropzone.active"
    class="fullscreen-dropzone"
    @dragleave="hideFullscreenDropzone"
    @dragover="handleDragover"
    @drop="handleDrop"
  >
    <div class="instruction-text">Drop image to upload as node thumbnail</div>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex"

export default {
  name: "fullscreen-dropzone",
  computed: {
    ...mapState(["fullscreenDropzone"]),
  },
  methods: {
    ...mapMutations(["setFullscreenDropzone"]),
    handleDragover(evt) {
      evt.preventDefault()
    },
    hideFullscreenDropzone() {
      this.setFullscreenDropzone({ active: false, file: null })
    },
    handleDrop(evt) {
      evt.preventDefault()
      evt.stopPropagation()
      this.setFullscreenDropzone({ active: false, file: evt.dataTransfer.files[0] })
    },
  },
}
</script>

<style lang="scss" scoped>
.fullscreen-dropzone {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: #1eade1cc;
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: 5px #fff dashed;
  outline-offset: -15px;
}

.instruction-text {
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
