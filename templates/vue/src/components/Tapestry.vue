<template>
  <div id="tapestry">
    <div
      v-if="!tapestryLoaded"
      class="d-flex justify-content-center mb-3"
      style="padding: 30vh 0;"
    >
      <label>Loading Tapestry</label>
      <b-spinner
        type="grow"
        variant="secondary"
        small
        style="margin: 5px 5px 5px 20px;"
      ></b-spinner>
      <b-spinner
        type="grow"
        variant="primary"
        small
        style="margin: 5px;"
      ></b-spinner>
      <b-spinner type="grow" variant="danger" small style="margin: 5px;"></b-spinner>
    </div>
    <settings-modal :wp-can-edit-tapestry="wpCanEditTapestry" />
    <root-node-button v-if="showRootNodeButton" @add-root-node="addRootNode" />
    <div v-if="showEmpty" style="margin-top: 40vh;">
      The requested tapestry is empty.
    </div>
    <node-modal
      :parent="parentNode"
      :node-id="populatedNode.id"
      :modal-type="modalType"
      @cancel="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex"
import NodeModal from "./NodeModal"
import SettingsModal from "./SettingsModal"
import RootNodeButton from "./RootNodeButton"
import TapestryApi from "../services/TapestryAPI"
import { tydeTypes } from "@/utils/constants"

export default {
  name: "tapestry",
  components: {
    NodeModal,
    RootNodeButton,
    SettingsModal,
  },
  data() {
    return {
      loadedH5pId: 0,
      TapestryAPI: new TapestryApi(wpPostId),
      tapestryLoaded: false,
      modalType: "",
      parentNode: null,
      populatedNode: {
        title: "",
        description: "",
        mediaType: "",
        typeData: {
          mediaURL: "",
          textContent: "",
        },
        mediaDuration: "",
        imageURL: "",
        lockedImageURL: "",
        showInBackpack: true,
        permissions: {
          public: ["read"],
          authenticated: ["read"],
        },
        quiz: [],
        skippable: true,
        tydeType: tydeTypes.REGULAR,
      },
      favourites: [],
    }
  },
  computed: {
    ...mapGetters([
      "selectedNode",
      "tapestry",
      "getNode",
      "getDirectParents",
      "settings",
    ]),
    showRootNodeButton: function() {
      return (
        this.tapestryLoaded &&
        !this.tapestry.rootId &&
        thisTapestryTool.canCurrentUserEdit()
      )
    },
    showEmpty: function() {
      return (
        this.tapestryLoaded &&
        !this.tapestry.rootId &&
        !thisTapestryTool.canCurrentUserEdit()
      )
    },
    xORfx: function() {
      return this.tapestry.settings.autoLayout ? "x" : "fx"
    },
    yORfy: function() {
      return this.tapestry.settings.autoLayout ? "y" : "fy"
    },
    wpCanEditTapestry: function() {
      return wpApiSettings && wpApiSettings.wpCanEditTapestry === "1"
    },
  },
  watch: {
    selectedNode() {
      this.parentNode = this.getNode(this.getDirectParents(this.selectedNode)[0])
    },
  },
  async created() {
    const tapestryApi = new TapestryApi(wpPostId)
    this.favourites = await tapestryApi.getUserFavourites()
  },
  mounted() {
    window.addEventListener("change-selected-node", this.changeSelectedNode)
    window.addEventListener("add-new-node", this.addNewNode)
    window.addEventListener("edit-node", this.editNode)
    window.addEventListener("tapestry-updated", this.tapestryUpdated)
    window.addEventListener("tapestry-open-node", this.openNode)
  },
  methods: {
    ...mapMutations([
      "init",
      "setDataset",
      "updateSelectedNode",
      "updateRootNode",
      "updateNodeCoordinates",
      "updateTydeProgress",
    ]),
    ...mapActions(["addNode", "addLink", "updateNode", "updateNodePermissions"]),
    openNode({ detail: { id } }) {
      this.$router.push(`/nodes/${id}`)
    },
    tapestryUpdated(event) {
      if (!this.tapestryLoaded) {
        event.detail.dataset["favourites"] = this.favourites
        this.init(event.detail.dataset)
        this.tapestryLoaded = true
      } else {
        this.setDataset(event.detail.dataset)
      }
      const stages = this.tapestry.nodes.filter(n => n.tydeType === tydeTypes.STAGE)
      stages.map(n =>
        this.updateTydeProgress({ parentId: n.id, isParentModule: false })
      )
    },
    getEmptyNode() {
      return {
        title: "",
        behaviour: "embed",
        mediaType: "",
        typeData: {
          mediaURL: "",
          textContent: "",
          subAccordionText: "More content:",
        },
        mediaDuration: "",
        imageURL: "",
        lockedImageURL: "",
        hideTitle: false,
        hideProgress: false,
        hideMedia: false,
        skippable: true,
        fullscreen: false,
        showInBackpack: true,
        permissions: this.settings.defaultPermissions
          ? this.settings.defaultPermissions
          : this.populatedNode.permissions,
        description: "",
        quiz: [],
        tydeType: tydeTypes.REGULAR,
        childOrdering: [],
      }
    },
    addRootNode() {
      this.parentNode = null
      this.modalType = "add"
      this.populatedNode = this.getEmptyNode()
      this.$bvModal.show("node-modal")
    },
    addNewNode() {
      this.parentNode = this.selectedNode
      this.modalType = "add"
      this.populatedNode = this.getEmptyNode()
      this.populatedNode.id = this.selectedNode.id
      this.$bvModal.show("node-modal")
    },
    editNode() {
      this.parentNode = this.getNode(this.getDirectParents(this.selectedNode.id)[0])
      this.modalType = "edit"
      this.populatedNode = this.selectedNode
      this.$bvModal.show("node-modal")
    },
    deleteNode() {
      thisTapestryTool.deleteNodeFromTapestry()
      this.closeModal()
    },
    closeModal() {
      this.modalType = ""
      this.parent = null
      this.$bvModal.hide("node-modal")
    },
    changeSelectedNode(event) {
      this.updateSelectedNode(event.detail)
    },
    handleSubmit() {
      thisTapestryTool.setDataset(this.tapestry)
      thisTapestryTool.setOriginalDataset(this.tapestry)
      thisTapestryTool.initialize(true)

      this.closeModal()
    },
  },
}
</script>

<style lang="scss" scoped></style>
