<template>
  <div id="tapestry">
    <node-modal
      :node-id="nodeId"
      :modal-type="modalType"
      @cancel="closeModal"
      @submit="closeModal"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex"
import NodeModal from "./NodeModal"
import TapestryApi from "../services/TapestryAPI"

export default {
  name: "tapestry",
  components: {
    NodeModal,
  },
  data() {
    return {
      tapestryLoaded: false,
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
    window.addEventListener("tapestry-updated", this.tapestryUpdated)
    window.addEventListener("tapestry-open-node", this.openNode)

    this.$root.$on("add-node", to => {
      this.modalType = "add"
      this.nodeId = to
      this.$bvModal.show("node-modal")
    })

    this.$root.$on("edit-node", nodeId => {
      this.modalType = "edit"
      this.nodeId = nodeId
      this.$bvModal.show("node-modal")
    })
  },
  methods: {
    ...mapMutations(["init", "setDataset", "updateSelectedNode"]),
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
    },
    changeSelectedNode(event) {
      this.updateSelectedNode(event.detail)
    },
    handleSubmit() {
      this.closeModal()
    },
  },
}
</script>
