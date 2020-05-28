<template>
  <b-modal
    id="node-modal"
    :title="title"
    size="lg"
    class="text-muted"
    scrollable
    body-class="p-0"
  >
    <div v-if="formErrors.length" class="modal-header-row">
      <b-alert
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
          <appearance-form :node="node" />
        </b-tab>
        <b-tab
          v-if="
            node.mediaType === 'h5p' ||
              node.mediaType === 'video' ||
              node.mediaType === 'accordion'
          "
          title="Behaviour"
        >
          <behaviour-form :node="node" />
        </b-tab>
        <b-tab v-if="viewAccess" title="Access">
          <h6 class="mt-4 mb-3 text-muted">Node Permissions</h6>
          <permissions-table v-model="node.permissions" />
          <h6 class="mt-4 mb-3 text-muted">Lock Node</h6>
          <conditions-form :node="node" />
        </b-tab>
        <b-tab
          v-if="node.mediaType === 'h5p' || node.mediaType === 'video'"
          title="Activity"
        >
          <activity-form :node="node" />
        </b-tab>
        <b-tab
          v-if="node.mediaType === 'accordion' || node.hasSubAccordion"
          title="Ordering"
        >
          <div>
            <slick-list
              :value="node.childOrdering"
              lock-axis="y"
              @input="updateOrderingArray"
            >
              <slick-item
                v-for="(childId, index) in node.childOrdering"
                :key="index"
                class="slick-list-item"
                :index="index"
                style="z-index: 9999 !important;"
              >
                <span class="fas fa-bars fa-xs"></span>
                <span>{{ getNode(childId).title }}</span>
                <span style="color: grey;">id: {{ childId }}</span>
              </slick-item>
            </slick-list>
          </div>
        </b-tab>
      </b-tabs>
    </b-container>
    <template slot="modal-footer">
      <b-button
        v-show="modalType === 'edit'"
        size="sm"
        variant="danger"
        @click="$emit('delete-node')"
      >
        Delete Node
      </b-button>
      <span style="flex-grow:1;"></span>
      <b-button size="sm" variant="secondary" @click="close">
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
import { SlickList, SlickItem } from "vue-slicksort"
import ActivityForm from "./node-modal/content-form/ActivityForm"
import AppearanceForm from "./node-modal/AppearanceForm"
import BehaviourForm from "./node-modal/BehaviourForm"
import ConditionsForm from "./node-modal/ConditionsForm"
import ContentForm from "./node-modal/ContentForm"
import PermissionsTable from "./node-modal/PermissionsTable"
import Helpers from "../utils/Helpers"

export default {
  name: "node-modal",
  components: {
    AppearanceForm,
    BehaviourForm,
    ContentForm,
    ActivityForm,
    ConditionsForm,
    SlickItem,
    SlickList,
    PermissionsTable,
  },
  props: {
    nodeId: {
      type: Number,
      required: false,
      default: null,
    },
    modalType: {
      type: String,
      required: true,
      validator: value => {
        return ["", "add", "edit"].includes(value)
      },
    },
  },
  data() {
    return {
      userId: null,
      formErrors: "",
      maxDescriptionLength: 250,
      node: null,
    }
  },
  computed: {
    ...mapGetters([
      "createDefaultNode",
      "getDirectChildren",
      "getDirectParents",
      "getNode",
      "settings",
    ]),
    parent() {
      if (this.modalType === "add") {
        const parent = this.getNode(this.nodeId)
        if (parent) {
          return parent
        }
      }
      return null
    },
    title() {
      if (this.modalType === "add") {
        return this.parent
          ? `Add new sub-topic to ${this.parent.title}`
          : "Add root node"
      } else if (this.modalType === "edit") {
        return `Edit node: ${this.node.title}`
      }
      return ""
    },
    nodeData() {
      return [
        { name: "title", value: this.node.title },
        {
          name: "conditions",
          value: this.node.conditions,
        },
        { name: "description", value: this.node.description },
        { name: "behaviour", value: this.node.behaviour },
        { name: "mediaType", value: this.node.mediaType },
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
  created() {
    this.node = this.createDefaultNode()
  },
  mounted() {
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      if (modalId == "node-modal") {
        this.formErrors = ""
        thisTapestryTool.disableMovements()
      }
    })
    this.$root.$on("bv::modal::shown", (_, modalId) => {
      if (modalId == "node-modal") {
        let copy = this.createDefaultNode()
        if (this.modalType === "edit") {
          const node = this.getNode(this.nodeId)
          copy = Helpers.deepCopy(node)
        }
        copy.hasSubAccordion = this.hasSubAccordion(copy)
        this.node = copy
      }
    })
    this.$root.$on("bv::modal::hide", (_, modalId) => {
      if (modalId == "node-modal") {
        thisTapestryTool.enableMovements()
      }
    })
  },
  methods: {
    ...mapMutations(["updateOrdering"]),
    hasSubAccordion(node) {
      const parents = this.getDirectParents(node.id)
      if (parents && parents[0]) {
        const parent = this.getNode(parents[0])
        const children = this.getDirectChildren(node.id)
        return parent.mediaType === "accordion" && children.length > 0
      }
      return false
    },
    close() {
      this.$bvModal.hide("node-modal")
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
