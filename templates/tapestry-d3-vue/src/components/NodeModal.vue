<template>
  <b-modal id="node-modal-container" size="lg" scrollable>
    <div class="d-block text-center" slot="modal-title">
      <h3>
        <strong>{{ modalTitle }}</strong>
      </h3>
    </div>
    <b-container id="modal-content-details">
      <b-row>
        <h4>Content Details</h4>
      </b-row>
      <b-row>
        <div>Title</div>
        <input placeholder="Enter title" required />
      </b-row>
      <b-row>
        <div>Description</div>
        <textarea placeholder="Enter description"></textarea>
      </b-row>
      <b-row>
        <div>Content Type</div>
        <b-form-select v-model="selectedMediaType" :options="options"></b-form-select>
      </b-row>
      <b-row v-show="selectedMediaType === 'text'">
        <div>Text content</div>
        <textarea id="tapestry-node-text-area" placeholder="Enter text here"></textarea>
      </b-row>
      <b-row v-show="selectedMediaType === 'video'">
        <div>Video URL</div>
        <input placeholder="Enter URL for MP4 Video" required />
      </b-row>
      <b-row v-show="selectedMediaType === 'video'">
        <div>Video Duration</div>
        <input placeholder="Enter duration (in seconds)" required />
      </b-row>
      <b-row v-show="selectedMediaType === 'h5p'">
        <div>H5P Embed Link</div>
        <input placeholder="Enter H5P Embed Link" required />
      </b-row>
      <b-row v-show="selectedMediaType === 'h5p'">
        <div>H5P Video Duration (only if video)</div>
        <input placeholder="Enter duration (in seconds)" required />
      </b-row>
    </b-container>
    <b-container id="modal-appearance">
      <b-row>
        <h4>Appearance</h4>
      </b-row>
      <b-row>
        <div>Thumbnail</div>
        <input placeholder="Enter the URL for the thumbnail" required />
      </b-row>
      <b-row>
        <b-form-checkbox v-model="lockNode">Hide node until parent node is viewed</b-form-checkbox>
      </b-row>
    </b-container>
    <b-container id="modal-permissions">
      <b-row>
        <h4>Permissions</h4>
      </b-row>
      <b-row>
        <b-table class="text-center" :items="items" :fields="fields" responsive="sm">
          <template slot="[read]">
            <b-form-checkbox></b-form-checkbox>
          </template>
          <template slot="[add]">
            <b-form-checkbox></b-form-checkbox>
          </template>
          <template slot="[edit]">
            <b-form-checkbox></b-form-checkbox>
          </template>
          <template slot="[add-submit]">
            <b-form-checkbox></b-form-checkbox>
          </template>
          <template slot="[edit-submit]">
            <b-form-checkbox></b-form-checkbox>
          </template>
          <template slot="[approve]">
            <b-form-checkbox></b-form-checkbox>
          </template>
        </b-table>
      </b-row>
    </b-container>
  </b-modal>
</template>

<script>
import Helpers from "../utils/Helpers"
import TapestryAPI from "../services/TapestryAPI"

export default {
  name: "node-modal",
  data() {
    return {
      lockNode: false,
      selectedMediaType: "default",
      options: [
        { value: 'default', text: 'Select content type' },
        { value: 'text', text: 'Text' },
        { value: 'video', text: 'Video' },
        { value: 'h5p', text: 'H5P' }
      ],
      fields: [
        { key: 'empty', label: '', thStyle: { 'word-break': 'unset' }, tdClass: 'cellTableStyles' },
        { key: 'read', label: 'Read', thStyle: { 'word-break': 'unset' } },
        { key: 'add', label: 'Add', thStyle: { 'word-break': 'unset' } },
        { key: 'edit', label: 'Edit', thStyle: { 'word-break': 'unset' } },
        { key: 'add-submit', label: 'Add Submit', thStyle: { 'word-break': 'unset' } },
        { key: 'edit-submit', label: 'Edit Submit', thStyle: { 'word-break': 'unset' } },
        { key: 'approve', label: 'Approve', thStyle: { 'word-break': 'unset' } }
      ],
      items: [
        { empty: 'Public' }
      ]
    }
  },
  props: {
    tapestry: {
      type: Object,
      required: false
    },
    modalType: {
      type: String,
      required: true,
      validator: function (value) {
        return ['add-new-node', 'edit-node', 'add-root-node', ''].indexOf(value) !== -1;
      }
    }
  },
  computed: {
    modalTitle() {
      const rootNode = this.getCurrentRootNode();
      if (this.modalType === 'add-new-node') {
        return `Add new sub-topic to ${rootNode.title}`;
      } else if (this.modalType === 'edit-node') {
        return `Edit node: ${rootNode.title}`;
      } else if (this.modalType === 'add-root-node') {
        return 'Add root node';
      } else {
        return '';
      }
    }
  },
  methods: {
    getCurrentRootNode() {
      if (this.tapestry && this.tapestry.nodes) {
        return this.tapestry.nodes.find(node => {
          return node.id = this.tapestry.rootId;
        });
      }
    },
    submitAddNewNode() {
      const formData = $("form").serializeArray();
      this.$emit("tapestryAddNewNode", formData, false);
    },
    submitAddRootNode() {
      const formData = $("form").serializeArray();
      this.$emit("tapestryAddNewNode", formData, false, true);
    },
    submitEditNode() {
      const formData = $("form").serializeArray();
      this.$emit("tapestryAddNewNode", formData, true);
    },
    addUser() {
      const userId = $("#user-number-input").val();
      if (userId && onlyContainsDigits(userId) && $("#user-" + userId + "-editcell").val() != "") {
        appendPermissionsRow(userId, "user");
        $("#user-number-input").val("");
      } else {
        alert("Enter valid user id");
      }
    }
  }
}
</script>

<style scoped>
#createNewNodeModalBody {
  text-align: left;
}

#modal-content-details > div:nth-child(4) {
  margin-bottom: 20px;
}

#modal-content-details,
#modal-appearance,
#modal-permissions {
  padding: 20px;
  /* border-bottom: 1px solid #ddd; */
}

#modal-content-details input,
#modal-content-details textarea,
#modal-appearance input,
#modal-appearance textarea,
#modal-permissions input,
#modal-permissions textarea {
  padding: 15px;
  margin: 5px 0 22px 0;
  border: none;
  background: #f1f1f1;
  width: 100%;
}
</style>

<style>
/* Use non-scoped styles to overwrite WP theme styles */
.cellTableStyles {
  word-break: unset;
}
</style>

