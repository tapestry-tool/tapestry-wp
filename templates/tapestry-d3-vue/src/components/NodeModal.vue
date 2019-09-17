<template>
  <b-modal id="node-modal-container" size="lg" scrollable v-bind:title="modalTitle">
    <b-container class="modal-section" id="modal-content-details">
      <b-row>
        <h4 class="modal-section-title">Content Details</h4>
      </b-row>
      <b-row>
        <label for="node-title">Title</label>
        <input
          id="node-title"
          class="modal-form-text-input"
          placeholder="Enter title"
          v-model="node.title"
          required
        />
      </b-row>
      <b-row>
        <label for="node-description">Description</label>
        <textarea
          id="node-description"
          class="modal-form-text-input"
          placeholder="Enter description"
          v-model="node.description"
        ></textarea>
      </b-row>
      <b-row>
        <label for="node-media-type">Content Type</label>
        <b-form-select id="node-media-type" v-model="node.mediaType" :options="mediaTypes"></b-form-select>
      </b-row>
      <b-row v-show="node.mediaType === 'text'">
        <label for="node-text-content">Text content</label>
        <textarea
          id="node-text-content"
          class="modal-form-text-input"
          placeholder="Enter text here"
          v-model="node.typeData.textContent"
        ></textarea>
      </b-row>
      <b-row v-show="node.mediaType === 'video'">
        <label for="node-video-media-url">Video URL</label>
        <input
          id="node-video-media-url"
          class="modal-form-text-input"
          placeholder="Enter URL for MP4 Video"
          v-model="node.typeData.mediaURL"
          required
        />
      </b-row>
      <b-row v-show="node.mediaType === 'video'">
        <label for="node-video-media-duration">Video Duration</label>
        <input
          id="node-video-media-duration"
          class="modal-form-text-input"
          placeholder="Enter duration (in seconds)"
          v-model="node.mediaDuration"
          required
        />
      </b-row>
      <b-row v-show="node.mediaType === 'h5p'">
        <label for="node-h5p-media-url">H5P Embed Link</label>
        <input
          id="node-h5p-media-url"
          class="modal-form-text-input"
          placeholder="Enter H5P Embed Link"
          v-model="node.typeData.mediaURL"
          required
        />
      </b-row>
      <b-row v-show="node.mediaType === 'h5p'">
        <label for="node-h5p-media-duration">H5P Video Duration (only if video)</label>
        <input
          id="node-h5p-media-duration"
          class="modal-form-text-input"
          placeholder="Enter duration (in seconds)"
          v-model="node.mediaDuration"
          required
        />
      </b-row>
    </b-container>
    <b-container id="modal-appearance" class="modal-section">
      <b-row>
        <h4 class="modal-section-title">Appearance</h4>
      </b-row>
      <b-row>
        <label for="node-image-url">Thumbnail</label>
        <input
          id="node-image-url"
          class="modal-form-text-input"
          placeholder="Enter the URL for the thumbnail"
          required
          v-model="node.imageURL"
        />
      </b-row>
      <b-row>
        <b-form-checkbox
          value="false"
          unchecked-value="true"
          v-model="node.unlocked"
        >Hide node until parent node is viewed</b-form-checkbox>
      </b-row>
    </b-container>
    <b-container id="modal-permissions" class="modal-section">
      <b-row>
        <h4 class="modal-section-title">Permissions</h4>
      </b-row>
      <b-row>
        <b-table-simple class="text-center" striped responsive>
          <b-thead>
            <b-tr>
              <b-th></b-th>
              <b-th>Read</b-th>
              <b-th>Add</b-th>
              <b-th>Edit</b-th>
              <b-th>Add Submit</b-th>
              <b-th>Edit Submit</b-th>
              <b-th>Approve</b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr v-for="(value, type) in node.permissions" :key="type" :value="value">
              <b-td>{{type}}</b-td>
              <b-td>
                <b-form-checkbox value="read" v-model="node.permissions[type]"></b-form-checkbox>
              </b-td>
              <b-td>
                <b-form-checkbox value="add" v-model="node.permissions[type]"></b-form-checkbox>
              </b-td>
              <b-td>
                <b-form-checkbox value="edit" v-model="node.permissions[type]"></b-form-checkbox>
              </b-td>
              <b-td>
                <b-form-checkbox value="add-submit" v-model="node.permissions[type]"></b-form-checkbox>
              </b-td>
              <b-td>
                <b-form-checkbox value="edit-submit" v-model="node.permissions[type]"></b-form-checkbox>
              </b-td>
              <b-td>
                <b-form-checkbox value="approve" v-model="node.permissions[type]"></b-form-checkbox>
              </b-td>
            </b-tr>
            <b-tr>
              <b-td colspan="7">
                <b-row>
                  <b-col cols="3">
                    <b-form-input v-model="userId" placeholder="123"></b-form-input>
                  </b-col>
                  <b-col cols="3">
                    <b-button variant="primary" @click="addUser()">
                      <span class="fas fa-plus permissions-plus"></span> User
                    </b-button>
                  </b-col>
                </b-row>
              </b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
      </b-row>
    </b-container>
    <template slot="modal-footer">
      <b-button size="sm" variant="danger" @click="$emit('close-modal')">Cancel</b-button>
      <b-button size="sm" variant="success" @click="submitNode()">Submit</b-button>
    </template>
  </b-modal>
</template>

<script>
import Helpers from "../utils/Helpers"
import TapestryAPI from "../services/TapestryAPI"

export default {
  name: "node-modal",
  data() {
    return {
      userId: null,
      mediaTypes: [
        { value: '', text: 'Select content type' },
        { value: 'text', text: 'Text' },
        { value: 'video', text: 'Video' },
        { value: 'h5p', text: 'H5P' }
      ]
    }
  },
  props: {
    node: {
      type: Object,
      required: false
    },
    modalType: {
      type: String,
      required: true,
      validator: function (value) {
        return ['add-new-node', 'edit-node', 'add-root-node', ''].indexOf(value) !== -1;
      }
    },
    rootNodeTitle: {
      type: String,
      required: false
    }
  },
  computed: {
    modalTitle() {
      if (this.modalType === 'add-new-node') {
        return `Add new sub-topic to ${this.rootNodeTitle}`;
      } else if (this.modalType === 'edit-node') {
        return `Edit node: ${this.rootNodeTitle}`;
      } else if (this.modalType === 'add-root-node') {
        return 'Add root node';
      } else {
        return '';
      }
    },
    nodeData() {
      return [
        { name: 'title', value: this.node.title },
        { name: 'mediaType', value: this.node.mediaType },
        { name: 'mediaURL', value: this.node.typeData && this.node.typeData.mediaURL },
        { name: 'textContent', value: this.node.typeData && this.node.typeData.textContent },
        { name: 'mediaDuration', value: this.node.mediaDuration },
        { name: 'imageURL', value: this.node.imageURL },
        { name: 'unlocked', value: this.node.unlocked },
        { name: 'permissions', value: this.node.permissions },
        { name: 'description', value: this.node.description },
      ]
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
    submitNode() {
      if (this.modalType === 'add-root-node') {
        this.$emit("add-edit-node", this.nodeData, false, true);
      } else if (this.modalType === 'add-new-node') {
        this.$emit("add-edit-node", this.nodeData, false);
      } else if (this.modalType === 'edit-node') {
        this.$emit("add-edit-node", this.nodeData, true);
      } else {
        console.error(`Undefined modalType: ${this.modalType}`)
      }
    },
    addUser() {
      const userId = this.userId;
      if (userId && onlyContainsDigits(userId) && $("#user-" + userId + "-editcell").val() != "") {
        this.$set(this.node.permissions, `user-${userId}`, [])
        this.userId = null;
      } else {
        alert("Enter valid user id");
      }
    }
  }
}
</script>

<style scoped>
.modal-section {
  margin-bottom: 20px;
}

.modal-section:last-child {
  margin-bottom: 0;
}

.modal-section > * {
  margin-bottom: 16px;
}

.modal-section-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0;
}

.modal-form-text-input {
  padding: 15px;
  border: none;
  background: #f1f1f1;
  width: 100%;
}

#createNewNodeModalBody {
  text-align: left;
}
</style>

<style>
/* Use non-scoped styles to overwrite WP theme styles */
table th,
table td {
  word-break: unset;
  border: none;
}

table {
  border: 1px solid #dee2e6;
}

/* overwrite bootstrap styles */
.modal-header {
  padding: 16px 24px;
}

.modal-title {
  font-size: 2rem;
  font-weight: 600;
}

.modal-body {
  padding: 32px 24px;
}
</style>

