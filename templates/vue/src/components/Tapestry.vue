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
    <settings-modal
      :tapestry-api-client="TapestryAPI"
      @settings-updated="handleSettingsUpdate"
    />
    <root-node-button
      v-show="tapestryLoaded && !tapestry.rootId"
      @add-root-node="addRootNode"
    />
    <node-modal
      :node="populatedNode"
      :modal-type="modalType"
      :root-node-title="selectedNode.title"
      @close-modal="closeModal"
      @add-edit-node="addEditNode"
      @delete-node="deleteNode"
    />
    <lightbox
      v-if="lightbox.isOpen"
      :tapestry-api-client="TapestryAPI"
      :node-id="lightbox.id"
      @close="closeLightbox"
      @update-node="updateNode"
    />
  </div>
</template>

<script>
import Helpers from "../utils/Helpers"
import NodeModal from "./NodeModal"
import SettingsModal from "./SettingsModal"
import RootNodeButton from "./RootNodeButton"
import TapestryAPI from "../services/TapestryAPI"
import Lightbox from "./Lightbox"

export default {
  name: "tapestry",
  components: {
    NodeModal,
    RootNodeButton,
    SettingsModal,
    Lightbox,
  },
  data() {
    return {
      tapestry: {},
      selectedNodeId: "",
      TapestryAPI: new TapestryAPI(wpPostId),
      tapestryLoaded: false,
      modalType: "",
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
        unlocked: true,
        permissions: { public: ["read"] },
      },
      lightbox: {
        isOpen: false,
        id: null,
      },
    }
  },
  computed: {
    xORfx: function() {
      return this.tapestry.settings.autoLayout ? "x" : "fx"
    },
    yORfy: function() {
      return this.tapestry.settings.autoLayout ? "y" : "fy"
    },
    selectedNode: function() {
      if (this.tapestry && this.tapestry.nodes) {
        if (this.selectedNodeId) {
          return this.tapestry.nodes.find(node => {
            return node.id === this.selectedNodeId
          })
        } else if (this.tapestry.rootId) {
          return this.tapestry.nodes.find(node => {
            return node.id === this.tapestry.rootId
          })
        }
      }
      return {}
    },
  },
  async mounted() {
    // Set up event listeners to communicate with D3 elements
    window.addEventListener("change-selected-node", this.changeSelectedNode)
    window.addEventListener("add-new-node", this.addNewNode)
    window.addEventListener("edit-node", this.editNode)
    window.addEventListener("tapestry-updated", this.tapestryUpdated)
    window.addEventListener("open-lightbox", this.openLightbox)
  },
  methods: {
    updateNode(node) {
      const oldNodeIndex = this.tapestry.nodes.findIndex(
        oldNode => oldNode.id === node.id
      )
      this.tapestry.nodes[oldNodeIndex].typeData = { ...node.typeData }
      this.tapestry.nodes[oldNodeIndex].imageURL = node.imageURL
      thisTapestryTool.setDataset(this.tapestry)
      thisTapestryTool.reinitialize()
    },
    openLightbox(event) {
      this.lightbox = {
        isOpen: true,
        id: event.detail,
      }
    },
    closeLightbox() {
      this.lightbox = {
        isOpen: false,
        id: null,
      }
    },
    tapestryUpdated(event) {
      this.tapestry = event.detail.dataset
      if (!this.tapestryLoaded) {
        this.selectedNodeId = this.tapestry.rootId
        this.tapestryLoaded = true
      }
    },
    getEmptyNode() {
      return {
        title: "",
        behaviour: "embed",
        mediaType: "",
        typeData: {
          mediaURL: "",
          textContent: "",
        },
        mediaDuration: "",
        imageURL: "",
        unlocked: true,
        hideTitle: false,
        hideProgress: false,
        hideMedia: false,
        permissions: { public: ["read"] },
        description: "",
      }
    },
    addRootNode() {
      this.modalType = "add-root-node"
      this.populatedNode = this.getEmptyNode()
      this.$bvModal.show("node-modal-container")
    },
    addNewNode() {
      this.modalType = "add-new-node"
      this.populatedNode = this.getEmptyNode()
      this.$bvModal.show("node-modal-container")
    },
    editNode() {
      this.modalType = "edit-node"
      this.populatedNode = this.selectedNode
      this.$bvModal.show("node-modal-container")
    },
    deleteNode() {
      thisTapestryTool.deleteNodeFromTapestry()
      this.closeModal()
    },
    closeModal() {
      this.modalType = ""
      this.$bvModal.hide("node-modal-container")
    },
    changeSelectedNode(event) {
      this.selectedNodeId = event.detail
    },
    async addEditNode(formData, isEdit) {
      const NORMAL_RADIUS = 140
      const ROOT_RADIUS_DIFF = 70

      const dimensions = thisTapestryTool.getTapestryDimensions()

      var isRoot = this.tapestry.nodes.length == 0

      // Add the node data first
      var newNodeEntry = {
        type: "tapestry_node",
        description: "",
        behaviour: "embed",
        status: "publish",
        nodeType: "",
        title: "",
        imageURL: "",
        mediaType: "video",
        mediaFormat: "",
        mediaDuration: 0,
        typeId: 1,
        group: 1,
        typeData: {
          linkMetadata: null,
          progress: [{ group: "viewed", value: 0 }, { group: "unviewed", value: 1 }],
          mediaURL: "",
          mediaWidth: 960, //TODO: This needs to be flexible with H5P
          mediaHeight: 600,
        },
        unlocked: true,
        hideTitle: false,
        hideProgress: false,
        hideMedia: false,
        coordinates: {
          x: 3000,
          y: 3000,
        },
      }

      if (isEdit) {
        // If just editing, set the node coordinates to its current location
        newNodeEntry.coordinates.x = this.tapestry.nodes[
          Helpers.findNodeIndex(this.selectedNodeId, this.tapestry)
        ].x
        newNodeEntry.coordinates.y = this.tapestry.nodes[
          Helpers.findNodeIndex(this.selectedNodeId, this.tapestry)
        ].y
        newNodeEntry.typeData.linkMetadata = this.tapestry.nodes[
          Helpers.findNodeIndex(this.selectedNodeId, this.tapestry)
        ].typeData.linkMetadata
      } else if (!isRoot) {
        // If adding a new node, add it to the right of the existing node
        newNodeEntry.coordinates.x =
          this.tapestry.nodes[
            Helpers.findNodeIndex(this.selectedNodeId, this.tapestry)
          ].x +
          (NORMAL_RADIUS + ROOT_RADIUS_DIFF) * 2 +
          50
        newNodeEntry.coordinates.y = this.tapestry.nodes[
          Helpers.findNodeIndex(this.selectedNodeId, this.tapestry)
        ].y
      }

      var appearsAt = 0
      for (var i = 0; i < formData.length; i++) {
        var fieldName = formData[i].name
        var fieldValue = formData[i].value

        switch (fieldName) {
          case "title":
            newNodeEntry[fieldName] = fieldValue
            break
          case "imageURL":
            newNodeEntry[fieldName] = fieldValue || ""
            break
          case "behaviour":
            newNodeEntry[fieldName] = fieldValue
            break
          case "mediaType":
            if (fieldValue === "text") {
              newNodeEntry["mediaType"] = "text"
            } else if (fieldValue === "video") {
              newNodeEntry["mediaType"] = "video"
              newNodeEntry["mediaFormat"] = "mp4"
            } else if (fieldValue === "h5p") {
              newNodeEntry["mediaType"] = "video"
              newNodeEntry["mediaFormat"] = "h5p"
            } else if (fieldValue === "url-embed") {
              newNodeEntry["mediaType"] = "url-embed"
              newNodeEntry["mediaFormat"] = "embed"
            }
            break
          case "textContent":
            if (fieldValue) {
              newNodeEntry.typeData.textContent = fieldValue
            }
            break
          case "mediaURL":
            if (fieldValue) {
              newNodeEntry.typeData.mediaURL = fieldValue
            }
            break
          case "mediaDuration":
            if (fieldValue) {
              newNodeEntry.mediaDuration = parseInt(fieldValue)
            }
            break
          case "unlocked":
            newNodeEntry.unlocked = String(fieldValue) === "true" || isRoot
            break
          case "hideTitle":
            newNodeEntry.hideTitle = fieldValue
            break
          case "hideProgress":
            newNodeEntry.hideProgress = fieldValue
            break
          case "hideMedia":
            newNodeEntry.hideMedia = fieldValue
            break
          case "description":
            newNodeEntry.description = fieldValue
            break
          case "permissions":
            newNodeEntry.permissions = fieldValue
            break
          default:
            break
        }
      }

      if (!isEdit) {
        // New node
        const response = await this.TapestryAPI.addNode(JSON.stringify(newNodeEntry))

        newNodeEntry.id = response.data.id

        this.tapestry.nodes.push(newNodeEntry)

        newNodeEntry[this.xORfx] = newNodeEntry.coordinates.x
        newNodeEntry[this.yORfy] = newNodeEntry.coordinates.y

        if (!isRoot) {
          // Add link from parent node to this node
          const newLink = {
            source: this.selectedNodeId,
            target: newNodeEntry.id,
            value: 1,
            type: "",
            appearsAt: appearsAt,
          }
          this.TapestryAPI.addLink(JSON.stringify(newLink))
          this.tapestry.links.push(newLink)
        } else {
          // Root node
          this.tapestry.rootId = newNodeEntry.id
          this.selectedNodeId = newNodeEntry.id
        }
      } else {
        // Editing existing node

        const response = await this.TapestryAPI.updateNode(
          this.selectedNodeId,
          JSON.stringify(newNodeEntry)
        )

        newNodeEntry.id = response.data.id

        var thisNodeIndex = Helpers.findNodeIndex(this.selectedNodeId, this.tapestry)

        for (let key in this.tapestry.nodes[thisNodeIndex]) {
          if (newNodeEntry.hasOwnProperty(key)) {
            this.tapestry.nodes[thisNodeIndex][key] = newNodeEntry[key]
          }
        }
      }

      // Update permissions
      this.TapestryAPI.updatePermissions(
        newNodeEntry.id,
        JSON.stringify(newNodeEntry.permissions)
      )

      // Update coordinates in dataset
      this.tapestry.nodes[Helpers.findNodeIndex(newNodeEntry.id, this.tapestry)][
        this.xORfx
      ] = newNodeEntry.coordinates.x
      this.tapestry.nodes[Helpers.findNodeIndex(newNodeEntry.id, this.tapestry)][
        this.yORfy
      ] = newNodeEntry.coordinates.y

      thisTapestryTool.setDataset(this.tapestry)
      thisTapestryTool.initialize(true)

      this.closeModal()
    },
    handleSettingsUpdate(settings) {
      this.tapestry.settings = settings
      thisTapestryTool.setDataset(this.tapestry)
      thisTapestryTool.reinitialize()
    },
  },
}
</script>

<style scoped></style>
