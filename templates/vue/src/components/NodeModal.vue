<template>
  <b-modal
    id="node-modal-container"
    size="lg"
    class="text-muted"
    scrollable
    body-class="p-0"
  >
    <template v-slot:modal-header="{ close }">
      <div class="modal-header-row">
        <h5>{{ modalTitle }}</h5>
        <b-button size="sm" variant="outline-danger" @click="close()">
          Close Modal
        </b-button>
      </div>
      <div class="modal-header-row">
        <b-alert
          v-if="formErrors.length"
          id="tapestry-modal-form-errors"
          variant="danger"
          show
          v-html="formErrors"
        ></b-alert>
      </div>
    </template>
    <b-container fluid class="px-0">
      <b-tabs card>
        <b-tab title="Content" active>
          <div id="modal-content-details">
            <b-form-group label="Title">
              <b-form-input
                id="node-title"
                v-model="node.title"
                data-testid="node-title"
                placeholder="Enter title"
                autofocus
                required
              />
            </b-form-group>
            <b-form-group label="Description">
              <b-form-textarea
                id="node-description"
                v-model="node.description"
                data-testid="node-description"
                placeholder="Enter description"
              ></b-form-textarea>
            </b-form-group>
            <b-form-group label="Content Type">
              <b-form-select
                id="node-media-type"
                data-testid="node-mediaType"
                :value="nodeType"
                :options="mediaTypes"
                @change="handleTypeChange"
              ></b-form-select>
            </b-form-group>
            <accordion-form v-if="node.mediaType === 'accordion'" :node="node" />
            <b-form-group v-show="node.mediaType === 'wp-post'" label="Post Name">
              <combobox
                v-model="node.typeData.mediaURL"
                item-text="title"
                item-value="id"
                empty-message="There are no Wordpress posts yet. Please add one in your WP dashboard."
                :options="wpPosts"
              >
                <template v-slot="slotProps">
                  <p>
                    <code>{{ slotProps.option.id }}</code>
                    {{ slotProps.option.title }}
                  </p>
                </template>
              </combobox>
            </b-form-group>
            <b-form-group v-show="node.mediaType === 'text'" label="Text content">
              <b-form-textarea
                id="node-text-content"
                v-model="node.typeData.textContent"
                data-testid="node-textContent"
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
                data-testid="node-videoUrl"
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
                data-testid="node-videoDuration"
                placeholder="Enter duration (in seconds)"
                required
              />
            </b-form-group>
            <b-form-group v-show="nodeType === 'h5p'" label="H5P Content">
              <combobox
                v-model="selectedH5pContent"
                item-text="title"
                item-value="id"
                empty-message="There's no H5P content yet. Please add one in your WP dashboard."
                :options="h5pContentOptions"
              >
                <template v-slot="slotProps">
                  <p>
                    <code>{{ slotProps.option.id }}</code>
                    {{ slotProps.option.title }}
                  </p>
                </template>
              </combobox>
            </b-form-group>
            <b-form-group
              v-show="nodeType === 'h5p'"
              label="H5P Video Duration"
              description="This only applies to video H5P content"
            >
              <b-form-input
                id="node-h5p-media-duration"
                v-model="node.mediaDuration"
                data-testid="node-h5pDuration"
                placeholder="Enter duration (in seconds)"
                required
              />
            </b-form-group>
            <b-form-group
              v-show="node.mediaType === 'gravity-form'"
              label="Gravity Form"
            >
              <combobox
                v-model="selectedGravityFormContent"
                item-text="title"
                item-value="id"
                empty-message="There are no forms available. Please add one in your WP dashboard."
                :options="gravityFormOptions"
              >
                <template v-slot="slotProps">
                  <p>
                    <code>{{ slotProps.option.id }}</code>
                    {{ slotProps.option.title }}
                  </p>
                </template>
              </combobox>
            </b-form-group>
            <b-form-group
              v-show="node.mediaType === 'url-embed'"
              label="External Link"
            >
              <b-form-input
                id="node-embed-media-duration"
                v-model="node.typeData.mediaURL"
                data-testid="node-linkUrl"
                placeholder="Enter embed link (starting with http)"
                required
              />
            </b-form-group>
            <b-form-group v-show="node.mediaType === 'url-embed'" label="Behaviour">
              <b-form-radio-group
                id="external-link-behaviour"
                v-model="node.behaviour"
              >
                <b-form-radio value="embed" data-testid="node-linkBehaviour-embed">
                  Embed in Tapestry
                </b-form-radio>
                <b-form-radio
                  value="new-window"
                  data-testid="node-linkBehaviour-new-window"
                >
                  Open in a New Window
                </b-form-radio>
              </b-form-radio-group>
            </b-form-group>
          </div>
        </b-tab>
        <b-tab title="Appearance">
          <div id="modal-appearance">
            <b-form-group>
              <b-form-checkbox
                v-model="addThumbnail"
                data-testid="node-appearance-add-thumbnail"
              >
                Add a thumbnail
              </b-form-checkbox>
            </b-form-group>
            <b-form-group v-if="addThumbnail">
              <b-form-input
                id="node-image-url"
                v-model="node.imageURL"
                data-testid="node-imageUrl"
                placeholder="Enter the URL for the thumbnail"
                required
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
          </div>
        </b-tab>
        <b-tab
          v-if="
            node.mediaType === 'h5p' ||
              node.mediaType === 'video' ||
              node.mediaType === 'accordion'
          "
          title="Behaviour"
        >
          <div id="modal-behaviour">
            <b-form-group>
              <b-form-checkbox
                v-if="node.mediaType !== 'accordion'"
                v-model="node.skippable"
                data-testid="node-behaviour-skippable"
              >
                Allow skipping video if user has not watched at least once
              </b-form-checkbox>
            </b-form-group>
            <b-form-group>
              <b-form-checkbox
                v-model="node.fullscreen"
                data-testid="node-behaviour-fullscreen"
              >
                Maximize video size to fit in the window
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
                </b-tr>
              </b-thead>
              <b-tbody>
                <b-tr
                  v-for="(value, rowName) in permissions"
                  :key="rowName"
                  :value="value"
                >
                  <b-th>{{ rowName }}</b-th>
                  <b-td>
                    <b-form-checkbox
                      v-model="node.permissions[rowName]"
                      value="read"
                      :disabled="isPermissionDisabled(rowName, 'read')"
                      :data-testid="`node-permissions-${rowName}-read`"
                      @change="updatePermissions($event, rowName, 'read')"
                    ></b-form-checkbox>
                  </b-td>
                  <b-td>
                    <b-form-checkbox
                      v-model="node.permissions[rowName]"
                      value="add"
                      :disabled="isPermissionDisabled(rowName, 'add')"
                      :data-testid="`node-permissions-${rowName}-add`"
                      @change="updatePermissions($event, rowName, 'add')"
                    ></b-form-checkbox>
                  </b-td>
                  <b-td>
                    <b-form-checkbox
                      v-model="node.permissions[rowName]"
                      value="edit"
                      :disabled="isPermissionDisabled(rowName, 'edit')"
                      :data-testid="`node-permissions-${rowName}-edit`"
                      @change="updatePermissions($event, rowName, 'edit')"
                    ></b-form-checkbox>
                  </b-td>
                </b-tr>
                <b-tr>
                  <b-td colspan="4">
                    <b-input-group>
                      <b-form-input
                        v-model="userId"
                        placeholder="Enter user ID"
                      ></b-form-input>
                      <b-button variant="secondary" @click="addUserPermissionRow()">
                        <span class="fas fa-plus mr-1"></span>
                        User
                      </b-button>
                    </b-input-group>
                  </b-td>
                </b-tr>
              </b-tbody>
            </b-table-simple>
          </div>
        </b-tab>
        <quiz-modal :node="node" />
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
import Combobox from "./Combobox"
import QuizModal from "./node-modal/QuizModal"
import H5PApi from "../services/H5PApi"
import WordpressApi from "../services/WordpressApi"
import GravityFormsApi from "../services/GravityFormsApi"
import AccordionForm from "./node-modal/AccordionForm"

export default {
  name: "node-modal",
  components: {
    AccordionForm,
    Combobox,
    QuizModal,
  },
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
        { value: "url-embed", text: "External Link" },
        { value: "wp-post", text: "Wordpress Post" },
        { value: "gravity-form", text: "Gravity Form" },
        { value: "accordion", text: "Accordion" },
      ],
      gravityFormOptions: [],
      h5pContentOptions: [],
      selectedGravityFormContent: "",
      selectedH5pContent: "",
      selectedWpPost: "",
      wpPosts: [],
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
        { name: "behaviour", value: this.node.behaviour },
        { name: "mediaType", value: this.nodeType },
        {
          name: "mediaURL",
          value: this.getMediaUrl(),
        },
        {
          name: "textContent",
          value: this.node.typeData && this.node.typeData.textContent,
        },
        { name: "mediaDuration", value: this.node.mediaDuration },
        {
          name: "imageURL",
          value: this.node.imageURL || "",
        },
        { name: "unlocked", value: this.node.unlocked },
        { name: "permissions", value: this.node.permissions },
        { name: "hideTitle", value: this.node.hideTitle },
        { name: "hideProgress", value: this.node.hideProgress },
        { name: "hideMedia", value: this.node.hideMedia },
        { name: "skippable", value: this.node.skippable },
        { name: "quiz", value: this.node.quiz || [] },
        { name: "fullscreen", value: this.node.fullscreen },
      ]
    },
    nodeImageUrl() {
      return this.node.imageURL
    },
    newPermissions() {
      const last = this.permissionsOrder[this.permissionsOrder.length - 1]
      return [...this.node.permissions[last]]
    },
    permissions() {
      const ordered = {}
      this.permissionsOrder.forEach(permission => {
        ordered[permission] = this.node.permissions[permission]
      })
      return ordered
    },
  },
  watch: {
    nodeImageUrl: function() {
      this.addThumbnail = this.node.imageURL && this.node.imageURL.length > 0
    },
    selectedH5pContent() {
      this.node.typeData.mediaURL = this.getMediaUrl()
    },
    selectedGravityFormContent(id) {
      this.node.typeData.mediaURL = id
    },
  },
  async mounted() {
    this.gravityFormOptions = await GravityFormsApi.getAllForms()
    this.h5pContentOptions = await H5PApi.getAllContent()
    this.wpPosts = await WordpressApi.getPosts()
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      if (modalId == "node-modal-container") {
        this.formErrors = ""
      }
    })
    this.$root.$on("bv::modal::shown", (bvEvent, modalId) => {
      if (modalId == "node-modal-container") {
        const selectedContent = this.h5pContentOptions.find(content =>
          this.filterContent(content)
        )
        if (this.node.mediaType === "gravity-form") {
          const selectedForm = this.gravityFormOptions.find(form => {
            return form.id === this.node.typeData.mediaURL
          })
          this.selectedGravityFormContent = selectedForm ? selectedForm.id : ""
        }
        this.selectedH5pContent = selectedContent ? selectedContent.id : ""
      }
    })
  },
  methods: {
    filterContent(content) {
      if (this.node.mediaFormat !== "h5p") {
        return false
      }
      const id = this.node.typeData.mediaURL.split("&id=")[1]
      return content.id == id
    },
    getMediaUrl() {
      if (this.nodeType !== "h5p") {
        return this.node.typeData && this.node.typeData.mediaURL
      }

      const adminAjaxUrl = wpData.adminAjaxUrl
      return `${adminAjaxUrl}?action=h5p_embed&id=${this.selectedH5pContent}`
    },
    getPermissionRowIndex(rowName) {
      return this.permissionsOrder.findIndex(thisRow => thisRow === rowName)
    },
    isPermissionDisabled(rowName, type) {
      if (rowName == "public") {
        return false
      }

      // keep going up until we find a non-user higher row
      const rowIndex = this.getPermissionRowIndex(rowName)
      const higherRow = this.permissionsOrder[rowIndex - 1]
      if (higherRow.startsWith("user")) {
        return this.isPermissionDisabled(higherRow, type)
      }

      const permissions = this.node.permissions[higherRow]
      if (permissions) {
        return permissions.includes(type)
      }
      return false
    },
    changeIndividualPermission(value, rowName, type) {
      let currentPermissions = this.node.permissions[rowName]
      if (!currentPermissions) {
        currentPermissions = []
      }
      let newPermissions = [...currentPermissions]
      if (value) {
        if (!currentPermissions.includes(value)) {
          newPermissions.push(value)
        }
      } else {
        newPermissions = currentPermissions.filter(permission => permission !== type)
      }
      this.$set(this.node.permissions, rowName, newPermissions)
    },
    updatePermissions(value, rowName, type) {
      if (rowName.startsWith("user")) {
        return this.changeIndividualPermission(value, rowName, type)
      }
      const rowIndex = this.getPermissionRowIndex(rowName)
      const lowerPriorityPermissions = this.permissionsOrder.slice(rowIndex + 1)
      lowerPriorityPermissions.forEach(newRow => {
        this.changeIndividualPermission(value, newRow, type)
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

      const quiz = this.node.quiz
      if (!this.validateQuiz(quiz)) {
        errMsgs.push("Please enter at least one answer ID for each question")
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
    validateQuiz(quiz) {
      return quiz.every(question => {
        return Object.values(question.answers).some(value => value.length > 0)
      })
    },
    addUserPermissionRow() {
      const userId = this.userId
      if (
        userId &&
        Helpers.onlyContainsDigits(userId) &&
        $("#user-" + userId + "-editcell").val() != ""
      ) {
        this.$set(this.node.permissions, `user-${userId}`, this.newPermissions)
        this.permissionsOrder.push(`user-${userId}`)
        this.userId = null
      } else {
        alert("Enter valid user id")
      }
    },
  },
}
</script>

<style lang="scss">
/* Use non-scoped styles to overwrite WP theme styles */
table {
  border: 1px solid #dee2e6;

  th,
  td {
    word-break: unset;
    border: none;
  }
}

/* overwrite bootstrap styles */
.modal-header {
  background: #f7f7f7;
  border: none;
  padding-bottom: 0;
  margin-left: 5px;
  flex-direction: column;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
}
</style>

<style lang="scss" scoped>
#node-modal-container {
  * {
    outline: none;
  }

  .form-control {
    padding: 15px;
    border: none;
    background: #f1f1f1;
  }

  .modal-header-row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.modal-header-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
