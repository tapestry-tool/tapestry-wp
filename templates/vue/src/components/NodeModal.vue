<template>
  <b-modal
    id="node-modal-container"
    size="lg"
    class="text-muted"
    scrollable
    :title="modalTitle"
    body-class="p-0"
  >
    <b-container fluid class="px-0">
      <b-tabs card>
        <b-tab title="Content" active>
          <div id="modal-content-details">
            <b-alert
              v-if="formErrors.length"
              id="tapestry-modal-form-errors"
              variant="danger"
              show
              v-html="formErrors"
            ></b-alert>
            <b-form-group label="Title">
              <b-form-input
                id="node-title"
                v-model="node.title"
                placeholder="Enter title"
                autofocus
                required
              />
            </b-form-group>
            <b-form-group label="Description">
              <b-form-textarea
                id="node-description"
                v-model="node.description"
                placeholder="Enter description"
              ></b-form-textarea>
            </b-form-group>
            <b-form-group label="Content Type">
              <b-form-select
                id="node-media-type"
                :value="nodeType"
                :options="mediaTypes"
                @change="handleTypeChange"
              ></b-form-select>
            </b-form-group>
            <b-form-group v-show="node.mediaType === 'text'" label="Text content">
              <b-form-textarea
                id="node-text-content"
                v-model="node.typeData.textContent"
                placeholder="Enter text here"
              ></b-form-textarea>
            </b-form-group>
            <b-form-group
              v-show="node.mediaType === 'video' && nodeType !== 'h5p'"
              label="Video URL"
            >
              <b-form-input
                id="node-video-media-url"
                v-model="node.typeData.mediaURL"
                placeholder="Enter URL for MP4 Video"
                required
              />
            </b-form-group>
            <b-form-group
              v-show="node.mediaType === 'video' && nodeType !== 'h5p'"
              label="Video Duration"
            >
              <b-form-input
                id="node-video-media-duration"
                v-model="node.mediaDuration"
                placeholder="Enter duration (in seconds)"
                required
              />
            </b-form-group>
            <b-form-group v-show="nodeType === 'h5p'" label="H5P Embed Link">
              <b-form-input
                id="node-h5p-media-url"
                v-model="node.typeData.mediaURL"
                placeholder="Enter H5P Embed Link"
                required
              />
            </b-form-group>
            <b-form-group
              v-show="nodeType === 'h5p'"
              label="H5P Video Duration"
              description="This only applies to video H5P content"
            >
              <b-form-input
                id="node-h5p-media-duration"
                v-model="node.mediaDuration"
                placeholder="Enter duration (in seconds)"
                required
              />
            </b-form-group>
            <b-form-group v-show="node.mediaType === 'url-embed'" label="Embed Link">
              <b-form-input
                id="node-embed-media-duration"
                v-model="node.typeData.mediaURL"
                placeholder="Enter embed link (starting with http)"
                required
              />
            </b-form-group>
          </div>
        </b-tab>
        <b-tab title="Appearance">
          <div id="modal-appearance">
            <b-form-group>
              <b-form-checkbox v-model="addThumbnail">
                Add a thumbnail
              </b-form-checkbox>
            </b-form-group>
            <b-form-group v-if="addThumbnail">
              <b-form-input
                id="node-image-url"
                v-model="node.imageURL"
                placeholder="Enter the URL for the thumbnail"
                required
              />
            </b-form-group>
            <!-- <b-form-group>
              <b-form-checkbox
                value="false"
                unchecked-value="true"
                v-model="node.unlocked"
              >Hide node until parent node is viewed</b-form-checkbox>
            </b-form-group> -->
            <b-form-group>
              <b-form-checkbox v-model="node.hideTitle">
                Hide node title
              </b-form-checkbox>
            </b-form-group>
            <b-form-group>
              <b-form-checkbox v-model="node.hideProgress">
                Hide progress bar
              </b-form-checkbox>
            </b-form-group>
            <b-form-group>
              <b-form-checkbox v-model="node.hideMedia">
                Hide media button
              </b-form-checkbox>
            </b-form-group>
          </div>
        </b-tab>
        <b-tab
          v-if="node.mediaType === 'h5p' || node.mediaType === 'video'"
          title="Behaviour"
        >
          <div id="modal-behaviour">
            <b-form-group>
              <b-form-checkbox v-model="node.skippable">
                Allow skipping video if user has not watched at least once
              </b-form-checkbox>
            </b-form-group>
          </div>
        </b-tab>
        <b-tab title="Permissions">
          <div id="modal-permissions">
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
                <b-tr
                  v-for="(value, type) in node.permissions"
                  :key="type"
                  :value="value"
                >
                  <b-th>{{ type }}</b-th>
                  <b-td>
                    <b-form-checkbox
                      v-model="node.permissions[type]"
                      value="read"
                      :disabled="getDisabled(type, 'read')"
                      @change="updatePermissions($event, type, 'read')"
                    ></b-form-checkbox>
                  </b-td>
                  <b-td>
                    <b-form-checkbox
                      v-model="node.permissions[type]"
                      value="add"
                      :disabled="getDisabled(type, 'add')"
                      @change="updatePermissions($event, type, 'add')"
                    ></b-form-checkbox>
                  </b-td>
                  <b-td>
                    <b-form-checkbox
                      v-model="node.permissions[type]"
                      value="edit"
                      :disabled="getDisabled(type, 'edit')"
                      @change="updatePermissions($event, type, 'edit')"
                    ></b-form-checkbox>
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
                      <b-form-input
                        v-model="userId"
                        placeholder="Enter user ID"
                      ></b-form-input>
                      <b-input-group-append>
                        <b-button
                          variant="secondary"
                          @click="addUserPermissionRow()"
                        >
                          <span class="fas fa-plus permissions-plus"></span>
                          User
                        </b-button>
                      </b-input-group-append>
                    </b-input-group>
                  </b-td>
                </b-tr>
              </b-tbody>
            </b-table-simple>
          </div>
        </b-tab>
      </b-tabs>
    </b-container>
    <template slot="modal-footer">
      <b-button
        v-show="modalType === 'edit-node'"
        size="sm"
        variant="danger"
        @click="$emit('delete-node')"
      >
        Delete Node
      </b-button>
      <span style="flex-grow:1;"></span>
      <b-button size="sm" variant="secondary" @click="$emit('close-modal')">
        Cancel
      </b-button>
      <b-button size="sm" variant="primary" @click="submitNode()">
        Submit
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import Helpers from "../utils/Helpers"

export default {
  name: "node-modal",
  props: {
    node: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    modalType: {
      type: String,
      required: true,
      validator: function(value) {
        return (
          ["add-new-node", "edit-node", "add-root-node", ""].indexOf(value) !== -1
        )
      },
    },
    rootNodeTitle: {
      type: String,
      required: false,
      default: "Node",
    },
    permissionsOrder: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      userId: null,
      mediaTypes: [
        { value: "", text: "Select content type" },
        { value: "text", text: "Text" },
        { value: "video", text: "Video" },
        { value: "h5p", text: "H5P" },
        { value: "url-embed", text: "URL Embed" },
      ],
      formErrors: "",
      maxDescriptionLength: 250,
      addThumbnail: false,
    }
  },
  computed: {
    nodeType() {
      if (this.node.mediaFormat === "h5p") {
        return "h5p"
      }
      return this.node.mediaType
    },
    modalTitle() {
      if (this.modalType === "add-new-node") {
        return `Add new sub-topic to ${this.rootNodeTitle}`
      } else if (this.modalType === "edit-node") {
        return `Edit node: ${this.rootNodeTitle}`
      } else if (this.modalType === "add-root-node") {
        return "Add root node"
      } else {
        return ""
      }
    },
    nodeData() {
      return [
        { name: "title", value: this.node.title },
        { name: "description", value: this.node.description },
        { name: "mediaType", value: this.nodeType },
        {
          name: "mediaURL",
          value: this.node.typeData && this.node.typeData.mediaURL,
        },
        {
          name: "textContent",
          value: this.node.typeData && this.node.typeData.textContent,
        },
        { name: "mediaDuration", value: this.node.mediaDuration },
        {
          name: "imageURL",
          value: this.addThumbnail ? this.node.imageURL : "",
        },
        { name: "unlocked", value: this.node.unlocked },
        { name: "permissions", value: this.node.permissions },
        { name: "hideTitle", value: this.node.hideTitle },
        { name: "hideProgress", value: this.node.hideProgress },
        { name: "hideMedia", value: this.node.hideMedia },
        { name: "skippable", value: this.node.skippable },
      ]
    },
    nodeImageUrl() {
      return this.node.imageURL
    },
    newPermissions() {
      const last = this.permissionsOrder[this.permissionsOrder.length - 1]
      return this.node.permissions[last]
    },
  },
  watch: {
    nodeImageUrl: function() {
      this.addThumbnail = this.node.imageURL.length > 0
    },
  },
  mounted() {
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      if (modalId == "node-modal-container") {
        this.formErrors = ""
      }
    })
  },
  methods: {
    getPriority(permissionType) {
      return this.permissionsOrder.findIndex(
        permission => permission === permissionType
      )
    },
    getDisabled(type, value) {
      const typeIndex = this.getPriority(type)
      const higherPriorityPermissionName = this.permissionsOrder[typeIndex - 1]
      const permissions = this.node.permissions[higherPriorityPermissionName]
      if (permissions) {
        return permissions.includes(value)
      }
      return false
    },
    updatePermissions(event, type, value) {
      const typeIndex = this.getPriority(type)
      const lowerPriorityPermissions = this.permissionsOrder.slice(typeIndex + 1)
      lowerPriorityPermissions.forEach(permission => {
        const currentPermissions = this.node.permissions[permission]
        let newPermissions = [...currentPermissions]
        if (event) {
          if (!currentPermissions.includes(event)) {
            newPermissions.push(event)
          }
        } else {
          newPermissions = currentPermissions.filter(
            permission => permission !== value
          )
        }
        this.$set(this.node.permissions, permission, newPermissions)
      })
    },
    handleTypeChange(event) {
      this.$set(this.node, "mediaType", event)
      if (event === "video" || event === "h5p") {
        this.$set(this.node, "mediaFormat", event === "video" ? "mp4" : "h5p")
      } else {
        this.$set(this.node, "mediaFormat", "")
      }
    },
    submitNode() {
      this.formErrors = this.validateNode(this.nodeData)
      if (!this.formErrors.length) {
        if (this.modalType === "add-root-node") {
          this.$emit("add-edit-node", this.nodeData, false, true)
        } else if (this.modalType === "add-new-node") {
          this.$emit("add-edit-node", this.nodeData, false)
        } else if (this.modalType === "edit-node") {
          this.$emit("add-edit-node", this.nodeData, true)
        } else {
          console.error(`Undefined modalType: ${this.modalType}`)
        }
      }
    },
    validateNode() {
      var errMsgs = []

      if (this.node.title.length == 0) {
        errMsgs.push("Please enter a title")
      }
      if (this.node.description.length > this.maxDescriptionLength) {
        errMsgs.push(
          "Please limit your description to under " +
            this.maxDescriptionLength +
            " characters"
        )
      }

      if (!this.node.mediaType) {
        errMsgs.push("Please select a Content Type")
      } else if (this.node.mediaType === "video") {
        if (this.node.typeData.mediaURL === "") {
          errMsgs.push("Please enter a Video URL")
        }
        if (!Helpers.onlyContainsDigits(this.node.mediaDuration)) {
          errMsgs.push("Please enter numeric value for Video Duration")
        }
      } else if (this.node.mediaType === "h5p") {
        if (this.node.typeData.mediaURL === "") {
          errMsgs.push("Please enter a H5P URL")
        }
        if (!Helpers.onlyContainsDigits(this.node.mediaDuration)) {
          errMsgs.push("Please enter numeric value for H5P Video Duration")
        }
      } else if (this.node.mediaType === "url-embed") {
        if (this.node.typeData.mediaURL === "") {
          errMsgs.push("Please enter an Embed URL")
        }
      } else if (this.node.mediaType === "text") {
        if (
          !this.node.typeData.textContent ||
          !this.node.typeData.textContent.length
        ) {
          errMsgs.push("Please enter Text Content for this node")
        }
      }

      return errMsgs.join("<br>")
    },
    addUserPermissionRow() {
      const userId = this.userId
      if (
        userId &&
        Helpers.onlyContainsDigits(userId) &&
        $("#user-" + userId + "-editcell").val() != ""
      ) {
        this.$set(this.node.permissions, `user-${userId}`, this.newPermissions)
        this.userId = null
      } else {
        alert("Enter valid user id")
      }
    },
  },
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
  background: #f7f7f7;
  border: none;
  padding-bottom: 0;
  margin-left: 5px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
}
</style>

<style scoped>
.form-control {
  padding: 15px;
  border: none;
  background: #f1f1f1;
}
</style>
