<template>
  <b-modal
    id="node-modal-container"
    :title="modalTitle"
    size="lg"
    class="text-muted"
    scrollable
    body-class="p-0"
  >
    <div class="modal-header-row">
      <b-alert
        v-if="formErrors.length"
        id="tapestry-modal-form-errors"
        variant="danger"
        show
        v-html="formErrors"
      ></b-alert>
    </div>
    <b-container fluid class="px-0">
      <b-tabs card>
        <b-tab title="Content" active>
          <content-form :node="node" />
        </b-tab>
        <b-tab title="Appearance">
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
                @input="setDefaultFullscreenOption"
              >
                Open content in fullscreen
              </b-form-checkbox>
            </b-form-group>
            <b-form-group
              v-if="node.fullscreen && (nodeType === 'video' || nodeType === 'h5p')"
              class="indented-options"
            >
              <b-form-radio v-model="node.fitWindow" name="fit-window" :value="true">
                Fit whole video in window
              </b-form-radio>
              <b-form-radio
                v-model="node.fitWindow"
                name="fit-window"
                :value="false"
              >
                Crop video to fill window (not recommended)
              </b-form-radio>
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
          </div>
        </b-tab>
        <b-tab v-if="viewAccess" title="Access">
          <h6 class="mt-4 mb-3 text-muted">Node Permissions</h6>
          <permissions-table v-model="node.permissions" />
          <h6 class="mt-4 mb-3 text-muted">Lock Node</h6>
          <conditions-form :node="node" @changed="lockNode = $event" />
        </b-tab>
        <b-tab
          v-if="node.mediaType === 'h5p' || node.mediaType === 'video'"
          title="Quiz"
        >
          <activity-form :node="node" />
        </b-tab>
        <b-tab
          v-if="node.mediaType === 'accordion' || hasSubAccordion"
          title="Ordering"
        >
          <div>
            <slick-list
              :value="node.childOrdering"
              lock-axis="y"
              @input="updateOrderingArray"
            >
              <slick-item
                v-for="(id, index) in node.childOrdering"
                :key="index"
                class="slick-list-item"
                :index="index"
                style="z-index: 9999 !important;"
              >
                <span class="fas fa-bars fa-xs"></span>
                <span>{{ getNode(id).title }}</span>
                <span style="color: grey;">id: {{ id }}</span>
              </slick-item>
            </slick-list>
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
import { mapGetters, mapMutations } from "vuex"
import ContentForm from "./node-modal/ContentForm"
import Helpers from "../utils/Helpers"
import ActivityForm from "./node-modal/content-form/ActivityForm"
import FileUpload from "./FileUpload"
import ConditionsForm from "./node-modal/ConditionsForm"
import { SlickList, SlickItem } from "vue-slicksort"
import PermissionsTable from "./node-modal/PermissionsTable"

export default {
  name: "node-modal",
  components: {
    ContentForm,
    ActivityForm,
    ConditionsForm,
    FileUpload,
    SlickItem,
    SlickList,
    PermissionsTable,
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
  },
  data() {
    return {
      userId: null,
      lockNode: false,
      formErrors: "",
      maxDescriptionLength: 250,
      addThumbnail: false,
      addLockedThumbnail: false,
    }
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getDirectParents", "getNode", "settings"]),
    hasSubAccordion() {
      const parents = this.getDirectParents(this.node.id)
      if (parents && parents[0]) {
        const parent = this.getNode(parents[0])
        const children = this.getDirectChildren(this.node.id)
        return parent.mediaType === "accordion" && children.length > 0
      }
      return false
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
        {
          name: "conditions",
          value: this.lockNode ? this.node.conditions || [] : [],
        },
        { name: "description", value: this.node.description },
        { name: "behaviour", value: this.node.behaviour },
        { name: "mediaType", value: this.nodeType },
        {
          name: "mediaURL",
          value: this.node.typeData.mediaURL,
        },
        {
          name: "textContent",
          value: this.node.typeData && this.node.typeData.textContent,
        },
        { name: "mediaDuration", value: this.node.mediaDuration },
        {
          name: "imageURL",
          value: this.addThumbnail ? this.node.imageURL || "" : "",
        },
        {
          name: "lockedImageURL",
          value: this.addLockedThumbnail ? this.node.lockedImageURL || "" : "",
        },
        { name: "permissions", value: this.node.permissions },
        { name: "hideTitle", value: this.node.hideTitle },
        { name: "hideProgress", value: this.node.hideProgress },
        { name: "hideMedia", value: this.node.hideMedia },
        { name: "skippable", value: this.node.skippable },
        { name: "quiz", value: this.node.quiz || [] },
        { name: "fullscreen", value: this.node.fullscreen },
        { name: "subAccordionText", value: this.node.typeData.subAccordionText },
        { name: "childOrdering", value: this.node.childOrdering },
        { name: "fitWindow", value: this.node.fitWindow },
      ]
    },
    viewAccess() {
      return this.settings.showAccess === undefined
        ? true
        : this.settings.showAccess
        ? true
        : wpData.wpCanEditTapestry !== ""
    },
  },
  async mounted() {
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      if (modalId == "node-modal-container") {
        this.formErrors = ""
        thisTapestryTool.disableMovements()
      }
    })
    this.$root.$on("bv::modal::shown", (bvEvent, modalId) => {
      if (modalId == "node-modal-container") {
        this.lockNode = this.node.conditions && this.node.conditions.length > 0
        this.addThumbnail = this.node.imageURL.length > 0
        this.addLockedThumbnail = this.node.lockedImageURL.length > 0
      }
    })
    this.$root.$on("bv::modal::hide", (_, modalId) => {
      if (modalId == "node-modal-container") {
        thisTapestryTool.enableMovements()
      }
    })
  },
  methods: {
    ...mapMutations(["updateOrdering"]),
    setDefaultFullscreenOption() {
      this.node.fitWindow = true
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
          errMsgs.push("Please select an H5P content for this node")
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
        return Object.values(question.answers).some(
          value => value && value.length > 0
        )
      })
    },
    updateOrderingArray(arr) {
      this.updateOrdering({
        id: this.node.id,
        ord: arr,
      })
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

  button.close {
    position: absolute;
    top: 15px;
    right: 12px;

    &:focus {
      outline: none;
    }
  }
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-link:focus {
  outline: none;
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
    margin-bottom: 0;

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

.slick-list-item {
  display: flex;
  height: 25px;
  border: lightgray solid 1.5px;
  margin: 10px 25px;
  border-radius: 5px;
  padding: 15px;
  align-items: center;
  > span {
    margin-right: 25px;
  }
  > span:last-of-type {
    margin-left: auto;
  }
}

.indented-options {
  border-left: solid 2px #ccc;
  padding-left: 1em;
}
</style>
