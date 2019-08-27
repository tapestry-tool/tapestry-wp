<template>
  <b-modal id="node-modal-container" size="lg" scrollable>
    <div class="d-block text-center" slot="modal-title">
      <h3>
        <strong>{{ modalTitle }}</strong>
      </h3>
    </div>
    <b-container id="modal-content-details">
      <div v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <div v-for:="error in errors">{{ error }}</div>
        </ul>
      </div>
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
        <b-form-select v-model="selectedMediaType" :options="options"></b-form-select>
      </b-row>
      <b-row v-show="selectedMediaType === 'text'">
        <div>Text content</div>
        <textarea id="tapestry-node-text-area" placeholder="Enter text here" v-model="textContent"></textarea>
      </b-row>
      <b-row v-show="selectedMediaType === 'video'">
        <div>Video URL</div>
        <input placeholder="Enter URL for MP4 Video" v-model="video.url" required />
      </b-row>
      <b-row v-show="selectedMediaType === 'video'">
        <div>Video Duration</div>
        <input placeholder="Enter duration (in seconds)" v-model="video.duration" required />
      </b-row>
      <b-row v-show="selectedMediaType === 'h5p'">
        <div>H5P Embed Link</div>
        <input placeholder="Enter H5P Embed Link" v-model="h5p.link" required />
      </b-row>
      <b-row v-show="selectedMediaType === 'h5p'">
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
            <b-tr>
              <b-td>Public</b-td>
              <b-td>
                <b-form-checkbox></b-form-checkbox>
              </b-td>
              <b-td>
                <b-form-checkbox></b-form-checkbox>
              </b-td>
              <b-td>
                <b-form-checkbox></b-form-checkbox>
              </b-td>
              <b-td>
                <b-form-checkbox></b-form-checkbox>
              </b-td>
              <b-td>
                <b-form-checkbox></b-form-checkbox>
              </b-td>
              <b-td>
                <b-form-checkbox></b-form-checkbox>
              </b-td>
            </b-tr>
            <b-tr>
              <b-td colspan="7">
                <b-row>
                  <b-col cols="3">
                    <b-form-input v-model="userId" placeholder="123"></b-form-input>
                  </b-col>
                  <b-col cols="3">
                    <b-button variant="primary">
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
      <b-button size="sm" variant="danger" @click="$bvModal.hide('node-modal-container')">Cancel</b-button>
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
      lockNode: false,
      userId: null,
      errors: [],
      title: '',
      description: '',
      textContent: '',
      video: {
        url: '',
        duration: 0
      },
      h5p: {
        link: '',
        duration: 0
      },
      selectedMediaType: 'default',
      options: [
        { value: 'default', text: 'Select content type' },
        { value: 'text', text: 'Text' },
        { value: 'video', text: 'Video' },
        { value: 'h5p', text: 'H5P' }
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
        this.$emit("tapestryAddNewNode", formData, false, true);
      } else if (this.modalType === 'add-new-node') {
        this.$emit("tapestryAddNewNode", formData, false);
      } else if (this.modalType === 'edit-node') {
        this.$emit("tapestryAddNewNode", formData, true);
      } else {
        console.error(`Undefined modalType: ${this.modalType}`)
      }
    },
    // submitAddNewNode() {
    //   const formData = $("form").serializeArray();
    //   this.$emit("tapestryAddNewNode", formData, false);
    // },
    // submitAddRootNode() {
    //   const formData = $("form").serializeArray();
    //   this.$emit("tapestryAddNewNode", formData, false, true);
    // },
    // submitEditNode() {
    //   const formData = $("form").serializeArray();
    //   this.$emit("tapestryAddNewNode", formData, true);
    // },
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

