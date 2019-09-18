<template>
  <div id="tapestry">
    <RootNodeButton v-show="!tapestry.rootId && !showNodeModal" @add-root-node="addRootNode" />
    <NodeModal
      :node="populatedNode"
      :modalType="modalType"
      :rootNodeTitle="getCurrentRootNode().title"
      @close-modal="closeModal"
      @add-edit-node="addEditNode"
    />
  </div>
</template>

<script>
import Helpers from "../utils/Helpers"
import NodeModal from './NodeModal'
import RootNodeButton from './RootNodeButton'
import TapestryAPI from '../services/TapestryAPI'

export default {
  name: 'tapestry',
  components: {
    NodeModal,
    RootNodeButton
  },
  async mounted() {
    this.TapestryAPI = new TapestryAPI(wpPostId);
    this.tapestry = await this.TapestryAPI.getTapestry();
    thisTapestryTool.setDataset(this.tapestry);
    thisTapestryTool.setOriginalDataset(this.tapestry);
    thisTapestryTool.initialize();

    // Set up event listeners to communicate with D3 elements
    window.addEventListener('change-root-node', this.changeRootNode)
    window.addEventListener('add-new-node', this.addNewNode)
    window.addEventListener('edit-node', this.editNode)
  },
  data() {
    return {
      tapestry: {},
      TapestryAPI: {},
      modalType: '',
      showNodeModal: false,
      populatedNode: {
        title: '',
        mediaType: '',
        typeData: {
          mediaURL: '',
          textContent: ''
        },
        mediaDuration: '',
        imageURL: '',
        unlocked: false,
        permissions: { public: ['read'] },
        description: ''
      }
    }
  },
  computed: {
      xORfx: function () {
          return this.tapestry.settings.autoLayout ? 'x' : 'fx';
      },
      yORfy: function () {
          return this.tapestry.settings.autoLayout ? 'y' : 'fy';
      },
  },
  methods: {
    getCurrentRootNode() {
      if (this.tapestry && this.tapestry.nodes && this.tapestry.rootId) {
        return this.tapestry.nodes.find(node => {
          return node.id === this.tapestry.rootId;
        });
      }
      return {};
    },
    addRootNode() {
      this.modalType = 'add-root-node';
      this.$bvModal.show('node-modal-container');
    },
    addNewNode() {
      this.modalType = 'add-new-node';
      this.populatedNode = {
        title: '',
        mediaType: '',
        typeData: {
          mediaURL: '',
          textContent: ''
        },
        mediaDuration: '',
        imageURL: '',
        unlocked: '',
        hideTitle: false,
        hideProgress: false,
        hideMedia: false,
        permissions: { public: ['read'] },
        description: ''
      };
      this.$bvModal.show('node-modal-container');
    },
    editNode() {
      this.modalType = 'edit-node';
      this.populatedNode = this.getCurrentRootNode();
      this.$bvModal.show('node-modal-container');
    },
    closeModal() {
      this.modalType = '';
      this.$bvModal.hide('node-modal-container');
    },
    changeRootNode(event) {
      this.tapestry.rootId = event.detail;
    },
    async addEditNode(formData, isEdit, isRoot = false) {
      const NORMAL_RADIUS = 140;
      const ROOT_RADIUS_DIFF = 70;
      let root = this.tapestry.rootId;

      var errorMsg = tapestryValidateNewNode(formData, isRoot);
      if (errorMsg) {
        alert(errorMsg);
        return;
      }

      // Add the node data first
      var newNodeEntry = {
        "type": "tapestry_node",
        "description": "",
        "status": "publish",
        "nodeType": "",
        "title": "",
        "imageURL": "",
        "mediaType": "video",
        "mediaFormat": "",
        "mediaDuration": 0,
        "typeId": 1,
        "group": 1,
        "typeData": {
          "progress": [
            { "group": "viewed", "value": 0 },
            { "group": "unviewed", "value": 1 }
          ],
          "mediaURL": "",
          "mediaWidth": 960,      //TODO: This needs to be flexible with H5P	
          "mediaHeight": 600
        },
        "unlocked": true,
        "hideTitle": false,
        "hideProgress": false,
        "hideMedia": false,
        "fx": Helpers.getBrowserWidth(),
        "fy": Helpers.getBrowserHeight()
      };

      if (isEdit) {
        // If just editing, set the node coordinates to its current location
        newNodeEntry[this.xOrfx] = this.tapestry.nodes[Helpers.findNodeIndex(root, this.tapestry)].x;
        newNodeEntry[this.yOrfy]= this.tapestry.nodes[Helpers.findNodeIndex(root, this.tapestry)].y;
      } else if (!isRoot) {
        // If adding a new node, add it to the right of the existing node
        newNodeEntry[this.xOrfx] = this.tapestry.nodes[Helpers.findNodeIndex(root, this.tapestry)].x + (NORMAL_RADIUS + ROOT_RADIUS_DIFF) * 2 + 50;
        newNodeEntry[this.yOrfy] = this.tapestry.nodes[Helpers.findNodeIndex(root, this.tapestry)].y;
      }

      var appearsAt = 0;
      for (var i = 0; i < formData.length; i++) {
        var fieldName = formData[i].name;
        var fieldValue = formData[i].value;

        switch (fieldName) {
          case "title":
            newNodeEntry[fieldName] = fieldValue;
            break;
          case "imageURL":
            newNodeEntry[fieldName] = fieldValue || "";
            break;
          case "mediaType":
            if (fieldValue === "text") {
              newNodeEntry["mediaType"] = "text";
            }
            else if (fieldValue === "video") {
              newNodeEntry["mediaType"] = "video";
              newNodeEntry["mediaFormat"] = "mp4";
            }
            else if (fieldValue === "h5p") {
              newNodeEntry["mediaType"] = "video";
              newNodeEntry["mediaFormat"] = "h5p";
            }
            break;
          case "textContent":
            if (fieldValue) {
              newNodeEntry.typeData.textContent = fieldValue;
            }
            break;
          case "mediaURL":
            if (fieldValue) {
              newNodeEntry.typeData.mediaURL = fieldValue;
            }
            break;
          case "mediaDuration":
            if (fieldValue) {
              newNodeEntry.mediaDuration = parseInt(fieldValue);
            }
            break;
          case "unlocked":
            newNodeEntry.unlocked = String(fieldValue) === 'true' || isRoot;
            break;
          case "hideTitle":
            newNodeEntry.hideTitle = fieldValue;
            break;
          case "hideProgress":
            newNodeEntry.hideProgress = fieldValue;
            break;
          case "hideMedia":
            newNodeEntry.hideMedia = fieldValue;
            break;
          case "description":
            newNodeEntry.description = fieldValue;
            break;
          case "permissions":
            newNodeEntry.permissions = fieldValue;
            break;
          default:
            break;
        }
      }

      if (!isEdit) {
        const response = await this.TapestryAPI.addNode(JSON.stringify(newNodeEntry));
        const result = response.data;

        // Save to database, first save node then the link
        // only add link if it's for adding new node and not root node
        // Add new node to this.tapestry after getting the id
        newNodeEntry.id = result.id;
        this.tapestry.nodes.push(newNodeEntry);

        if (!isRoot) {
          // Get ID from callback and set it as target's id
          const newLink = { "source": root, "target": result.id, "value": 1, "type": "", "appearsAt": appearsAt };

          await this.TapestryAPI.addLink(JSON.stringify(newLink));

          // Add the new link to the this.tapestry
          this.tapestry.links.push(newLink);
        } else {
          const newId = result.id;

          await this.TapestryAPI.updatePermissions(newId, JSON.stringify(newNodeEntry.permissions));

          this.tapestry.rootId = newId;

          root = this.tapestry.rootId; // need to set root to newly created node
        }
      } else {
        // Call endpoint for editing node
        const response = await this.TapestryAPI.updateNode(root, JSON.stringify(newNodeEntry));
        const result = response.data;

        newNodeEntry.id = result.id;

        this.tapestry.nodes[Helpers.findNodeIndex(root, this.tapestry)] = newNodeEntry;
      }

      thisTapestryTool.setDataset(this.tapestry);
      thisTapestryTool.initialize(true);

      this.modalType = '';
      this.$bvModal.hide('node-modal-container');
    }
  }
}
</script>

<style scoped>
</style>
