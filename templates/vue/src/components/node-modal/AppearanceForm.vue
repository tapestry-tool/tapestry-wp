<template>
  <div id="modal-appearance">
    <h6 class="mb-3 text-muted">Node Appearance</h6>
    <b-form-group>
      <b-form-checkbox
        v-model="addThumbnail"
        data-testid="node-appearance-add-thumbnail"
      >
        Add a thumbnail
      </b-form-checkbox>
    </b-form-group>
    <b-form-group v-if="addThumbnail">
      <file-upload
        v-model="node.imageURL"
        data-testid="node-imageUrl"
        placeholder="Enter the URL for the thumbnail"
      />
    </b-form-group>
    <b-form-group v-if="addThumbnail">
      <b-form-checkbox
        v-model="addLockedThumbnail"
        data-testid="node-appearance-add-locked-thumbnail"
      >
        Show a different thumbnail when locked
      </b-form-checkbox>
    </b-form-group>
    <b-form-group v-if="addThumbnail && addLockedThumbnail">
      <file-upload
        v-model="node.lockedImageURL"
        data-testid="node-lockedImageURL"
        placeholder="Enter the URL for the thumbnail"
      />
    </b-form-group>
    <b-form-group>
      <b-form-checkbox
        v-model="node.hideTitle"
        data-testid="node-appearance-hide-title"
      >
        Hide node title
      </b-form-checkbox>
    </b-form-group>
    <b-form-group>
      <b-form-checkbox
        v-model="node.hideProgress"
        data-testid="node-appearance-hide-progress"
      >
        Hide progress bar
      </b-form-checkbox>
    </b-form-group>
    <b-form-group>
      <b-form-checkbox
        v-model="node.hideMedia"
        data-testid="node-appearance-hide-media"
      >
        Hide media button
      </b-form-checkbox>
    </b-form-group>
    <h6 class="mt-4 mb-3 text-muted">Content Appearance</h6>
    <b-form-group>
      <b-form-checkbox
        v-model="node.fullscreen"
        data-testid="node-behaviour-fullscreen"
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
  created() {
    this.addThumbnail = this.node.imageURL.length > 0
    this.addLockedThumbnail = this.node.lockedImageURL.length > 0
  },
}
</script>
