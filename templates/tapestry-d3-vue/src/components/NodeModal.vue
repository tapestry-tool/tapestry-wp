<template>
  <b-modal id="node-modal-container" size="lg" class="text-muted" scrollable :title="modalTitle">
    <b-container fluid class="px-0">
      <b-tabs card>
        <b-tab title="Content" active>
          <div id="modal-content-details" class="px-3">
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
            <b-row class="mt-2">
              <label for="node-description">Description</label>
              <textarea
                id="node-description"
                class="modal-form-text-input"
                placeholder="Enter description"
                v-model="node.description"
              ></textarea>
            </b-row>
            <b-row class="mt-2">
              <label for="node-media-type">Content Type</label>
              <b-form-select id="node-media-type" v-model="node.mediaType" :options="mediaTypes"></b-form-select>
            </b-row>
            <b-row class="mt-2" v-show="node.mediaType === 'text'">
              <label for="node-text-content">Text content</label>
              <textarea
                id="node-text-content"
                class="modal-form-text-input"
                placeholder="Enter text here"
                v-model="node.typeData.textContent"
              ></textarea>
            </b-row>
            <b-row class="mt-2" v-show="node.mediaType === 'video'">
              <label for="node-video-media-url">Video URL</label>
              <input
                id="node-video-media-url"
                class="modal-form-text-input"
                placeholder="Enter URL for MP4 Video"
                v-model="node.typeData.mediaURL"
                required
              />
            </b-row>
            <b-row class="mt-2" v-show="node.mediaType === 'video'">
              <label for="node-video-media-duration">Video Duration</label>
              <input
                id="node-video-media-duration"
                class="modal-form-text-input"
                placeholder="Enter duration (in seconds)"
                v-model="node.mediaDuration"
                required
              />
            </b-row>
            <b-row class="mt-2" v-show="node.mediaType === 'h5p'">
              <label for="node-h5p-media-url">H5P Embed Link</label>
              <input
                id="node-h5p-media-url"
                class="modal-form-text-input"
                placeholder="Enter H5P Embed Link"
                v-model="node.typeData.mediaURL"
                required
              />
            </b-row>
            <b-row class="mt-2" v-show="node.mediaType === 'h5p'">
              <label for="node-h5p-media-duration">H5P Video Duration (only if video)</label>
              <input
                id="node-h5p-media-duration"
                class="modal-form-text-input"
                placeholder="Enter duration (in seconds)"
                v-model="node.mediaDuration"
                required
              />
            </b-row>
          </div>
        </b-tab>
        <b-tab title="Appearance">
          <div id="modal-appearance" class="px-3">
            <b-row>
              <b-form-checkbox
                v-model="addThumbnail"
              >Add a thumbnail</b-form-checkbox>
            </b-row>
            <b-row class="mt-2" v-if="addThumbnail">
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
            <b-row>
              <b-form-checkbox v-model="node.hideTitle">Hide node title</b-form-checkbox>
            </b-row>
            <b-row>
              <b-form-checkbox v-model="node.hideProgress">Hide progress bar</b-form-checkbox>
            </b-row>
            <b-row>
              <b-form-checkbox v-model="node.hideMedia">Hide media button</b-form-checkbox>
            </b-row>
          </div>
        </b-tab>
        <b-tab title="Permissions">
          <div id="modal-permissions" class="px-3">
            <b-row>
              <b-table-simple class="text-center" striped responsive>
                <b-thead>
                  <b-tr>
                    <b-th></b-th>
                    <b-th>Read</b-th>
                    <b-th>Add</b-th>
                    <b-th>Edit</b-th>
                    <!--
                    <b-th>Add Submit</b-th>
                    <b-th>Edit Submit</b-th>
                    <b-th>Approve</b-th>
                    -->
                  </b-tr>
                </b-thead>
                <b-tbody>
                  <b-tr v-for="(value, type) in node.permissions" :key="type" :value="value">
                    <b-th>{{type}}</b-th>
                    <b-td>
                      <b-form-checkbox value="read" v-model="node.permissions[type]"></b-form-checkbox>
                    </b-td>
                    <b-td>
                      <b-form-checkbox value="add" v-model="node.permissions[type]"></b-form-checkbox>
                    </b-td>
                    <b-td>
                      <b-form-checkbox value="edit" v-model="node.permissions[type]"></b-form-checkbox>
                    </b-td>
                    <!--
                    <b-td>
                      <b-form-checkbox value="add-submit" v-model="node.permissions[type]"></b-form-checkbox>
                    </b-td>
                    <b-td>
                      <b-form-checkbox value="edit-submit" v-model="node.permissions[type]"></b-form-checkbox>
                    </b-td>
                    <b-td>
                      <b-form-checkbox value="approve" v-model="node.permissions[type]"></b-form-checkbox>
                    </b-td>
                    -->
                  </b-tr>
                  <b-tr>
                    <b-td colspan="4">
                      <b-input-group>
                        <b-form-input v-model="userId" placeholder="Enter user ID"></b-form-input>
                        <b-input-group-append>
                          <b-button variant="secondary" @click="addUser()">
                            <span class="fas fa-plus permissions-plus"></span> User
                          </b-button>
                        </b-input-group-append>
                      </b-input-group>
                    </b-td>
                  </b-tr>
                </b-tbody>
              </b-table-simple>
            </b-row>
          </div>
        </b-tab>
      </b-tabs>
    </b-container>
    <template slot="modal-footer">
      <b-button v-show="modalType === 'edit-node'" size="sm" variant="danger" @click="$emit('delete-node')">Delete Node</b-button>
      <span style="flex-grow:1;"></span>
      <b-button size="sm" variant="secondary" @click="$emit('close-modal')">Cancel</b-button>
      <b-button size="sm" variant="primary" @click="submitNode()">Submit</b-button>
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
      ],
      addThumbnail: true
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
        { name: 'imageURL', value: this.addThumbnail ? this.node.imageURL : '' },
        { name: 'unlocked', value: this.node.unlocked },
        { name: 'permissions', value: this.node.permissions },
        { name: 'hideTitle', value: this.node.hideTitle },
        { name: 'hideProgress', value: this.node.hideProgress },
        { name: 'hideMedia', value: this.node.hideMedia }
      ]
    },
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
  padding: 0;
}
</style>

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
  font-size: 1.6rem;
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

