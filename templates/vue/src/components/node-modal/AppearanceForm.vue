<template>
  <div id="modal-appearance">
    <h6 class="mb-3">Node Appearance</h6>
    <b-card class="px-3 pt-3" bg-variant="light" no-body>
      <b-form-group>
        <b-form-checkbox v-model="addThumbnail" data-qa="node-appearance-thumbnail">
          Add a thumbnail
        </b-form-checkbox>
      </b-form-group>
      <b-form-group v-if="addThumbnail">
        <file-upload
          v-model="node.imageURL"
          input-test-id="node-appearance-thumbnail-url"
          :hideUrlUpload="true"
          @isUploading="handleUploadChange"
        />
      </b-form-group>
      <b-form-group>
        <b-form-checkbox
          v-model="addLockedThumbnail"
          data-qa="node-appearance-lockedThumbnail"
        >
          Show a different thumbnail when locked
        </b-form-checkbox>
      </b-form-group>
      <b-form-group v-if="addLockedThumbnail">
        <file-upload v-model="node.lockedImageURL"
        input-test-id="node-lockedImageURL" :="true"
        @isUploading="handleUploadChange" />
      </b-form-group>
      <b-form-group>
        <b-form-checkbox v-model="node.hideTitle" data-qa="node-appearance-title">
          Hide node title
        </b-form-checkbox>
      </b-form-group>
      <b-form-group>
        <b-form-checkbox
          v-model="node.hideProgress"
          data-qa="node-appearance-progress"
        >
          Hide progress bar
        </b-form-checkbox>
      </b-form-group>
      <b-form-group>
        <b-form-checkbox v-model="node.hideMedia" data-qa="node-appearance-media">
          Hide media button
        </b-form-checkbox>
      </b-form-group>
    </b-card>
    <h6 class="mt-4 mb-3">Content Appearance</h6>
    <b-card class="px-3 pt-3" bg-variant="light" no-body>
      <b-form-group>
        <b-form-checkbox
          v-model="node.fullscreen"
          data-qa="node-behaviour-fullscreen"
          @input="node.fitWindow = true"
        >
          Open content in fullscreen
        </b-form-checkbox>
      </b-form-group>
      <b-form-group
        v-if="
          node.fullscreen && (node.mediaType === 'video' || node.mediaType === 'h5p')
        "
        class="indented-options"
      >
        <b-form-radio v-model="node.fitWindow" name="fit-window" :value="true">
          Fit whole video in window
        </b-form-radio>
        <b-form-radio v-model="node.fitWindow" name="fit-window" :value="false">
          Crop video to fill window (not recommended)
        </b-form-radio>
      </b-form-group>
    </b-card>
  </div>
</template>

<script>
import FileUpload from "@/components/FileUpload"

export default {
  components: {
    FileUpload,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      addThumbnail: false,
      addLockedThumbnail: false,
    }
  },
  watch: {
    addThumbnail(addThumbnail) {
      if (!addThumbnail) {
        this.node.imageURL = ""
      }
    },
    addLockedThumbnail(addLockedThumbnail) {
      if (!addLockedThumbnail) {
        this.node.lockedImageURL = ""
      }
    },
  },
  created() {
    this.addThumbnail = this.node.imageURL.length > 0
    this.addLockedThumbnail = this.node.lockedImageURL.length > 0
  },
  methods: {
    handleUploadChange(state) {
      this.$root.$emit("node-modal::uploading", state)
    },
  },
}
</script>
