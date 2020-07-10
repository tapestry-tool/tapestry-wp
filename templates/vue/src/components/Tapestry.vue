<template>
  <div id="tapestry">
    <loading v-if="!tapestryLoaded" style="padding: 30vh 0;" label="Loading" />
    <div v-if="tapestryLoaded && !tapestry.rootId">
      <root-node-button v-if="wpCanEditTapestry" />
      <div v-else style="margin-top: 40vh;">
        The requested tapestry is empty.
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex"
import RootNodeButton from "./RootNodeButton"
import TapestryApi from "../services/TapestryAPI"
import Loading from "@/components/Loading"

export default {
  name: "tapestry",
  components: {
    RootNodeButton,
    Loading,
  },
  data() {
    return {
      tapestryLoaded: false,
      modalType: "",
      nodeId: null,
    }
  },
  computed: {
    ...mapGetters(["selectedNode", "tapestry"]),
    wpCanEditTapestry: function() {
      return wpApiSettings && wpApiSettings.wpCanEditTapestry === "1"
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
    window.addEventListener("open-settings-modal", this.openSettings)
  },
  methods: {
    ...mapMutations(["init", "setDataset", "updateSelectedNode"]),
    openNode({ detail: { id } }) {
      this.$router.push(`/nodes/view/${id}`)
    },
    tapestryUpdated(event) {
      if (!this.tapestryLoaded) {
        event.detail.dataset["favourites"] = this.favourites
        this.init(event.detail.dataset)
        this.tapestryLoaded = true
      } else {
        this.setDataset(event.detail.dataset)
      }
    },
    addNewNode() {
      this.modalType = "add"
      this.nodeId = this.selectedNode.id
      this.$router.push(`/nodes/${this.modalType}/${this.nodeId}`)
    },
    editNode() {
      this.modalType = "edit"
      this.nodeId = this.selectedNode.id
      this.$router.push(`/nodes/${this.modalType}/${this.nodeId}`)
    },
    changeSelectedNode(event) {
      this.updateSelectedNode(event.detail)
    },
    handleSubmit() {
      thisTapestryTool.setDataset(this.tapestry)
      thisTapestryTool.setOriginalDataset(this.tapestry)
      thisTapestryTool.initialize(true)
    },
    openSettings() {
      this.$router.push(`/settings`)
    },
  },
}
</script>
