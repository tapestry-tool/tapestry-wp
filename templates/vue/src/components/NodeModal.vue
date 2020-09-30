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
      <b-alert id="tapestry-modal-form-errors" variant="danger" show>
        <ul>
          <li v-for="error in formErrors" :key="error">{{ error }}</li>
        </ul>
      </b-alert>
    </div>
    <b-container v-if="ready" fluid class="px-0">
      <b-tabs card>
        <b-tab title="Content" active>
          <content-form
            :node="node"
            :parent="parent"
            @load="videoLoaded = true"
            @unload="videoLoaded = false"
            @type-changed="handleTypeChange"
          />
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
        <b-tab v-if="node.tydeType === tydeTypes.MODULE" title="Spaceship Part">
          <spaceship-part-form :node="node" />
        </b-tab>
        <b-tab
          v-if="
            node.tydeType === tydeTypes.MODULE ||
              node.mediaType === 'accordion' ||
              node.hasSubAccordion ||
              node.tydeType === tydeTypes.STAGE
          "
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
        <b-tab title="More Information">
          <more-information-form :node="node" />
        </b-tab>
      </b-tabs>
    </b-container>
    <b-container v-else class="spinner">
      <b-spinner variant="secondary"></b-spinner>
    </b-container>
    <template slot="modal-footer">
      <delete-node-button
        v-if="modalType === 'edit'"
        :node-id="nodeId"
        :disabled="disableDeleteButton"
        @submit="close"
      ></delete-node-button>
      <p v-if="disableDeleteButton" class="disable-message text-muted">
        You cannot delete this node because this {{ node.tydeType }} node still has
        children.
      </p>
      <span style="flex-grow:1;"></span>
      <b-button size="sm" variant="secondary" @click="close">
        Cancel
      </b-button>
      <b-button
        id="submit-button"
        size="sm"
        variant="primary"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        <b-spinner v-if="!canSubmit" small></b-spinner>
        <div :style="canSubmit ? '' : 'opacity: 50%;'">Submit</div>
      </b-button>
    </template>
    <div v-if="loadDuration">
      <iframe
        v-if="node.mediaType === 'h5p'"
        ref="frame"
        class="duration-calculator"
        :src="node.typeData.mediaURL"
        @load="setH5pDuration"
      ></iframe>
      <video
        v-if="node.mediaFormat === 'mp4'"
        ref="video"
        :src="node.typeData.mediaURL"
        style="display: none;"
        @loadeddata="setVideoDuration"
      ></video>
      <youtube
        v-if="node.mediaFormat === 'youtube'"
        :video-id="node.typeData.youtubeID"
        :player-vars="{ autoplay: 0 }"
        style="display: none;"
        @ready="setYouTubeDuration"
      ></youtube>
    </div>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex"
import { SlickList, SlickItem } from "vue-slicksort"
import ActivityForm from "./node-modal/content-form/ActivityForm"
import { tydeTypes } from "../utils/constants"
import AppearanceForm from "./node-modal/AppearanceForm"
import BehaviourForm from "./node-modal/BehaviourForm"
import ConditionsForm from "./node-modal/ConditionsForm"
import ContentForm from "./node-modal/ContentForm"
import SpaceshipPartForm from "./node-modal/SpaceshipPartForm"
import MoreInformationForm from "./node-modal/MoreInformationForm"
import PermissionsTable from "./node-modal/PermissionsTable"
import DeleteNodeButton from "./node-modal/DeleteNodeButton"
import Helpers from "@/utils/Helpers"
import { sizes } from "@/utils/constants"
import { getLinkMetadata } from "@/services/LinkPreviewApi"

const shouldFetch = (url, selectedNode) => {
  if (!selectedNode.typeData.linkMetadata) {
    return true
  }
  const oldUrl = selectedNode.typeData.linkMetadata.url
  return !oldUrl.startsWith(Helpers.normalizeUrl(url))
}

export default {
  name: "node-modal",
  components: {
    AppearanceForm,
    BehaviourForm,
    ContentForm,
    ActivityForm,
    ConditionsForm,
    MoreInformationForm,
    SlickItem,
    SlickList,
    PermissionsTable,
    SpaceshipPartForm,
    DeleteNodeButton,
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
      ready: false,
      userId: null,
      formErrors: [],
      maxDescriptionLength: 250,
      tydeTypes: tydeTypes,
      node: null,
      videoLoaded: false,
      fileUploading: false,
      loadDuration: false,
    }
  },
  computed: {
    ...mapGetters([
      "createDefaultNode",
      "getDirectChildren",
      "getDirectParents",
      "getNode",
      "getParent",
    ]),
    ...mapState(["rootId", "settings", "visibleNodes"]),
    parent() {
      return this.getNode(
        this.modalType === "add" ? this.nodeId : this.getParent(this.nodeId)
      )
    },
    hasChildren() {
      if (this.modalType === "edit") {
        return this.getDirectChildren(this.node.id).length > 0
      } else {
        return false
      }
    },
    disableDeleteButton() {
      if (
        this.node.tydeType === tydeTypes.MODULE ||
        this.node.tydeType === tydeTypes.STAGE
      ) {
        return this.hasChildren
      }
      return false
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
    viewAccess() {
      return this.settings.showAccess === undefined
        ? true
        : this.settings.showAccess
        ? true
        : wpData.wpCanEditTapestry !== ""
    },
    canSubmit() {
      return !this.fileUploading
    },
  },
  created() {
    this.node = this.createDefaultNode()
  },
  mounted() {
    this.$root.$on("node-modal::uploading", isUploading => {
      this.fileUploading = isUploading
    })
    this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
      if (modalId == "node-modal") {
        this.formErrors = ""
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
        this.node.tydeType = this.getInitialTydeType(this.parent)
        this.ready = true
      }
    })
    this.$root.$on("bv::modal::hide", (_, modalId) => {
      if (modalId == "node-modal") {
        this.ready = false
      }
    })
  },
  methods: {
    ...mapMutations(["updateSelectedNode", "updateRootNode", "updateVisibleNodes"]),
    ...mapActions([
      "addNode",
      "addLink",
      "updateNode",
      "updateNodePermissions",
      "updateLockedStatus",
    ]),
    getInitialTydeType(parent) {
      if (this.parent) {
        const parentType = parent.tydeType
        return parentType === tydeTypes.MODULE
          ? tydeTypes.STAGE
          : parentType === tydeTypes.STAGE
          ? tydeTypes.QUESTION_SET
          : tydeTypes.REGULAR
      }
      return null
    },
    hasSubAccordion(node) {
      if (this.parent) {
        const children = this.getDirectChildren(node.id)
        return this.parent.mediaType === "accordion" && children.length > 0
      }
      return false
    },
    close() {
      this.$bvModal.hide("node-modal")
      this.$emit("cancel")
    },
    async handleSubmit() {
      this.formErrors = this.validateNode()
      if (!this.formErrors.length) {
        this.updateNodeCoordinates()
        this.ready = false

        if (this.node.mediaType === "url-embed" && this.node.behaviour !== "embed") {
          await this.setLinkData()
        }

        if (this.shouldReloadDuration()) {
          this.loadDuration = true
        } else {
          return this.submitNode()
        }
      }
    },
    async submitNode() {
      if (this.modalType === "add") {
        const id = await this.addNode({
          newNode: this.node,
          parentId: this.parentId,
        })
        this.node.id = id
        if (this.parent) {
          // Add link from parent node to this node
          const newLink = {
            source: this.parent.id,
            target: id,
            value: 1,
            type: "",
          }
          await this.addLink(newLink)
          this.updateNode({
            id: this.parent.id,
            newNode: {
              childOrdering: [...this.parent.childOrdering, id],
            },
          })
        } else {
          this.updateRootNode(id)
          this.updateSelectedNode(id)
        }
        this.updateVisibleNodes([...this.visibleNodes, id])
      } else {
        await this.updateNode({
          id: this.node.id,
          newNode: this.node,
        })
      }
      await this.updateLockedStatus()
      this.$emit("submit")
    },
    getRandomNumber(min, max) {
      return Math.random() * (max - min) + min
    },
    coinToss() {
      return Math.floor(Math.random() * 2) == 0
    },
    calculateX(yIsCalculated) {
      if (!yIsCalculated) {
        if (this.coinToss()) {
          this.node.coordinates.x = this.getRandomNumber(
            this.parent.coordinates.x +
              sizes.NODE_RADIUS_SELECTED +
              sizes.NODE_RADIUS,
            this.parent.coordinates.x + sizes.NODE_RADIUS_SELECTED * 2
          )
        } else {
          this.node.coordinates.x = this.getRandomNumber(
            this.parent.coordinates.x -
              sizes.NODE_RADIUS_SELECTED -
              sizes.NODE_RADIUS,
            this.parent.coordinates.x - sizes.NODE_RADIUS_SELECTED * 2
          )
        }
        this.calculateY(true)
      } else {
        this.node.coordinates.x = this.getRandomNumber(
          this.parent.coordinates.x - sizes.NODE_RADIUS_SELECTED * 2,
          this.parent.coordinates.x + sizes.NODE_RADIUS_SELECTED * 2
        )
      }
    },
    calculateY(xIsCalculated) {
      if (!xIsCalculated) {
        if (this.coinToss()) {
          this.node.coordinates.y = this.getRandomNumber(
            this.parent.coordinates.y +
              sizes.NODE_RADIUS_SELECTED +
              sizes.NODE_RADIUS,
            this.parent.coordinates.y + sizes.NODE_RADIUS_SELECTED * 2
          )
        } else {
          this.node.coordinates.y = this.getRandomNumber(
            this.parent.coordinates.y -
              sizes.NODE_RADIUS_SELECTED -
              sizes.NODE_RADIUS,
            this.parent.coordinates.y - sizes.NODE_RADIUS_SELECTED * 2
          )
        }
        this.calculateX(true)
      } else {
        this.node.coordinates.y = this.getRandomNumber(
          this.parent.coordinates.y - sizes.NODE_RADIUS_SELECTED * 2,
          this.parent.coordinates.y + sizes.NODE_RADIUS_SELECTED * 2
        )
      }
    },
    updateNodeCoordinates() {
      if (this.modalType === "add" && this.parent) {
        this.coinToss() ? this.calculateX(false) : this.calculateY(false)
      }
    },
    validateNode() {
      const errMsgs = []

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

      return errMsgs
    },
    validateQuiz(quiz) {
      return quiz.every(question => {
        return Object.values(question.answers).some(
          value => value && value.length > 0
        )
      })
    },
    updateOrderingArray(arr) {
      this.node.childOrdering = arr
    },
    handleTypeChange() {
      this.node.quiz = this.node.quiz.filter(q =>
        Object.values(q.answers).reduce((acc, { value }) => acc || value == "")
      )
    },
    async setLinkData() {
      if (shouldFetch(this.node.typeData.mediaURL, this.node)) {
        const url = this.node.typeData.mediaURL
        const { data } = await getLinkMetadata(url)

        if (data) {
          this.node.typeData.linkMetadata = data

          if (
            !this.node.imageURL ||
            confirm(
              "Would you like to use the link preview image as the thumbnail image?"
            )
          ) {
            this.node.imageURL = data.image
          }
          if (
            !this.node.lockedImageURL ||
            confirm(
              "Would you like to use the link preview image as the locked thumbnail image?"
            )
          ) {
            this.node.lockedImageURL = data.image
          }
        }
      }
    },
    setVideoDuration() {
      this.node.mediaDuration = parseInt(this.$refs.video.duration)
      this.loadDuration = false
      return this.submitNode()
    },
    setYouTubeDuration(evt) {
      this.node.mediaDuration = evt.target.getDuration()
      this.loadDuration = false
      return this.submitNode()
    },
    setH5pDuration() {
      const frame = this.$refs.frame
      const h5p = frame.contentWindow.H5P
      if (h5p) {
        const instance = h5p.instances[0]
        const libraryName = instance.libraryInfo.machineName
        if (libraryName === "H5P.InteractiveVideo") {
          const h5pVideo = instance.video
          const handleH5PLoad = () => {
            this.node.mediaDuration = parseInt(h5pVideo.getDuration())
            this.loadDuration = false
            return this.submitNode()
          }
          if (h5pVideo.getDuration() !== undefined) {
            handleH5PLoad()
          } else {
            h5pVideo.on("loaded", handleH5PLoad)
          }
          return
        } else {
          this.node.mediaDuration = 0
        }
      }
      this.loadDuration = false
      return this.submitNode()
    },
    shouldReloadDuration() {
      if (this.node.mediaType !== "video" && this.node.mediaType !== "h5p") {
        return false
      }
      if (this.modalType === "add") {
        return true
      }
      const oldNode = this.getNode(this.nodeId)
      const { youtubeID, mediaURL } = oldNode.typeData
      return this.node.mediaFormat === "youtube"
        ? this.node.typeData.youtubeID !== youtubeID
        : this.node.mediaURL !== mediaURL
    },
  },
}
</script>

<style lang="scss" scoped>
.duration-calculator {
  position: fixed;
  left: 101vw;
  width: 1px;
}
</style>

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
.spinner {
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

#submit-button {
  display: flex;
  align-items: center;
  flex-direction: row-reverse;

  div {
    margin-right: 4px;
  }
}

#node-modal-container {
  * {
    outline: none;
  }

  .disable-message {
    font-size: 0.9em;
    padding: 0;
    margin: 0 0 0 8px;
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

  #submit-button {
    position: relative;
    > span {
      position: absolute;
      height: 1.5em;
      width: 1.5em;
      left: 33%;
    }

    &:disabled {
      pointer-events: none;
      cursor: not-allowed;
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

    &.disabled {
      pointer-events: none;
      cursor: not-allowed;
    }
  }
}

.indented-options {
  border-left: solid 2px #ccc;
  padding-left: 1em;
}
</style>
