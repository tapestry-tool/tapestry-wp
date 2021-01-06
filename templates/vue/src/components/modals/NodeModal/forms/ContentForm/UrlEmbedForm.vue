<template>
  <div>
    <b-form-group label="External Link">
      <file-upload
        v-model="node.typeData.mediaURL"
        input-test-id="node-link-url"
        placeholder="Enter embed link (starting with http)"
        @isUploading="handleUploadChange"
      />
    </b-form-group>
    <b-form-group label="Behaviour">
      <b-form-radio-group id="external-link-behaviour" v-model="node.behaviour">
        <b-form-radio value="new-window" data-qa="node-link-new-window">
          Open in a New Window
        </b-form-radio>
        <b-form-radio value="embed" data-qa="node-link-embed">
          Embed in Tapestry
        </b-form-radio>
      </b-form-radio-group>
    </b-form-group>
    <b-alert variant="danger" :show="node.behaviour === 'embed'">
      Embedding links may not work if the site owner of your link does not allow it.
    </b-alert>
  </div>
</template>

<script>
import FileUpload from "@/components/modals/common/FileUpload"

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
  methods: {
    handleUploadChange(state) {
      this.$root.$emit("node-modal::uploading", state)
    },
  },
}
</script>
