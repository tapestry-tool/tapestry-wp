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
        <input placeholder="Enter title" v-model="title" required />
      </b-row>
      <b-row>
        <div>Description</div>
        <textarea placeholder="Enter description" v-model="description"></textarea>
      </b-row>
      <b-row>
        <div>Content Type</div>
        <b-form-select v-model="mediaType" :options="options"></b-form-select>
      </b-row>
      <b-row v-show="mediaType === 'text'">
        <div>Text content</div>
        <textarea id="tapestry-node-text-area" placeholder="Enter text here" v-model="textContent"></textarea>
      </b-row>
      <b-row v-show="mediaType === 'video'">
        <div>Video URL</div>
        <input placeholder="Enter URL for MP4 Video" v-model="video.url" required />
      </b-row>
      <b-row v-show="mediaType === 'video'">
        <div>Video Duration</div>
        <input placeholder="Enter duration (in seconds)" v-model="video.duration" required />
      </b-row>
      <b-row v-show="mediaType === 'h5p'">
        <div>H5P Embed Link</div>
        <input placeholder="Enter H5P Embed Link" v-model="h5p.url" required />
      </b-row>
      <b-row v-show="mediaType === 'h5p'">
        <div>H5P Video Duration (only if video)</div>
        <input placeholder="Enter duration (in seconds)" v-model="h5p.duration" required />
      </b-row>
    </b-container>
    <b-container id="modal-appearance">
      <b-row>
        <h4>Appearance</h4>
      </b-row>
      <b-row>
        <div>Thumbnail</div>
        <input placeholder="Enter the URL for the thumbnail" required v-model="imageURL" />
      </b-row>
      <b-row>
        <b-form-checkbox v-model="locked">Hide node until parent node is viewed</b-form-checkbox>
      </b-row>
    </b-container>
    <b-container id="modal-permissions">
      <b-row>
        <h4>Permissions</h4>
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
            <b-tr v-for="(value, type) in permissions" :key="type" :value="value">
              <b-td>{{type}}</b-td>
              <b-td>
                <b-form-checkbox value="read" v-model="permissions[type]"></b-form-checkbox>
              </b-td>
              <b-td>
                <b-form-checkbox value="add" v-model="permissions[type]"></b-form-checkbox>
              </b-td>
              <b-td>
                <b-form-checkbox value="edit" v-model="permissions[type]"></b-form-checkbox>
              </b-td>
              <b-td>
                <b-form-checkbox value="add-submit" v-model="permissions[type]"></b-form-checkbox>
              </b-td>
              <b-td>
                <b-form-checkbox value="edit-submit" v-model="permissions[type]"></b-form-checkbox>
              </b-td>
              <b-td>
                <b-form-checkbox value="approve" v-model="permissions[type]"></b-form-checkbox>
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
      locked: this.modalType !== 'add-new-node' ? !this.node.unlocked : null,
      title: this.modalType !== 'add-new-node' ? this.node.title : null,
      description: this.modalType !== 'add-new-node' ? this.node.description : null,
      textContent: this.modalType !== 'add-new-node' ? this.node.typeData && this.node.typeData.textContent : null,
      video: {
        url: this.modalType !== 'add-new-node' && this.node.mediaType === 'video' ? this.node.typeData && this.node.typeData.mediaURL : null,
        duration: this.modalType !== 'add-new-node' && this.node.mediaType === 'video' ? this.node.mediaDuration : null
      },
      h5p: {
        url: this.modalType !== 'add-new-node' && this.node.mediaType === 'h5p' ? this.node.typeData && this.node.typeData.mediaURL : null,
        duration: this.modalType !== 'add-new-node' && this.node.mediaType === 'h5p' ? this.node.mediaDuration : null
      },
      imageURL: this.modalType !== 'add-new-node' ? this.node.imageURL : null,
      mediaType: this.modalType !== 'add-new-node' ? this.node.mediaType : 'default',
      options: [
        { value: 'default', text: 'Select content type' },
        { value: 'text', text: 'Text' },
        { value: 'video', text: 'Video' },
        { value: 'h5p', text: 'H5P' }
      ],
      permissions: this.modalType !== 'add-new-node' ? this.node.permissions : { public: ['read'] }
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
    }
  },
  computed: {
    modalTitle() {
      if (this.modalType === 'add-new-node') {
        return `Add new sub-topic to ${this.node.title}`;
      } else if (this.modalType === 'edit-node') {
        return `Edit node: ${this.node.title}`;
      } else if (this.modalType === 'add-root-node') {
        return 'Add root node';
      } else {
        return '';
      }
    },
    nodeData() {
      return [
        { name: 'title', value: this.title },
        { name: 'mediaType', value: this.mediaType },
        { name: 'mp4-mediaURL', value: this.video.url },
        { name: 'mp4-mediaDuration', value: this.video.duration },
        { name: 'h5p-mediaURL', value: this.h5p.url },
        { name: 'h5p-mediaDuration', value: this.h5p.duration },
        { name: 'imageURL', value: this.imageURL },
        { name: 'unlocked', value: !this.locked },
        { name: 'permissions', value: this.permissions },
        { name: 'description', value: this.description }
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
        this.$emit("tapestryAddNewNode", this.nodeData, false, true);
      } else if (this.modalType === 'add-new-node') {
        this.$emit("tapestryAddNewNode", this.nodeData, false);
      } else if (this.modalType === 'edit-node') {
        this.$emit("tapestryAddNewNode", this.nodeData, true);
      } else {
        console.error(`Undefined modalType: ${this.modalType}`)
      }
    },
    addUser() {
      const userId = this.userId;
      if (userId && onlyContainsDigits(userId) && $("#user-" + userId + "-editcell").val() != "") {
        this.$set(this.permissions, `user-${userId}`, [])
        this.userId = null;
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
#modal-appearance textarea {
  padding: 15px;
  margin: 5px 0 22px 0;
  border: none;
  background: #f1f1f1;
  width: 100%;
}
</style>

<style>
/* Use non-scoped styles to overwrite WP theme styles */
table th,
table td {
  word-break: unset;
}
</style>

