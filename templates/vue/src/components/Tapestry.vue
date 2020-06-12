<template>
  <div id="tapestry">
    <loading
      v-if="!tapestryLoaded"
      style="padding: 30vh 0;"
      label="Loading Tapestry"
    />
    <settings-modal :wp-can-edit-tapestry="wpCanEditTapestry" />
    <div v-if="tapestryLoaded && !tapestry.rootId">
      <root-node-button v-if="wpCanEditTapestry" @click="addRootNode" />
      <div v-else style="margin-top: 40vh;">
        The requested tapestry is empty.
      </div>
    </div>
    <node-modal
      :parent-id="parentId"
      :node-id="nodeId"
      :modal-type="modalType"
      @cancel="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex"
import NodeModal from "./NodeModal"
import SettingsModal from "./SettingsModal"
import RootNodeButton from "./RootNodeButton"
import TapestryApi from "../services/TapestryAPI"
import { tydeTypes } from "@/utils/constants"
import Loading from "@/components/Loading"

export default {
  name: "tapestry",
  components: {
    NodeModal,
    RootNodeButton,
    SettingsModal,
    Loading,
  },
  data() {
    return {
      tapestryLoaded: false,
      modalType: "",
      parentId: null,
      nodeId: null,
    }
  },
  computed: {
    ...mapGetters(["selectedNode", "tapestry", "getDirectParents"]),
    wpCanEditTapestry: function() {
      return wpApiSettings && wpApiSettings.wpCanEditTapestry === "1"
    },
  },
  watch: {
    selectedNode() {
      this.parentId = this.getDirectParents(this.selectedNode)[0]
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
      "updateTydeProgress",
    ]),
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
    addRootNode() {
      this.parentNode = null
      this.modalType = "add"
      this.$bvModal.show("node-modal")
    },
    addNewNode() {
      this.parentId = this.selectedNode.id
      this.modalType = "add"
      this.nodeId = this.selectedNode.id
      this.$bvModal.show("node-modal")
    },
    editNode() {
      this.parentId = this.getDirectParents(this.selectedNode.id)[0]
      this.modalType = "edit"
      this.nodeId = this.selectedNode.id
      this.$bvModal.show("node-modal")
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
