<template>
  <div id="tapestry-container">
    <div id="tapestry">
      <loading v-if="!tapestryLoaded" style="padding: 30vh 0;" label="Loading" />
      <settings-modal :wp-can-edit-tapestry="wpCanEditTapestry" />
      <div v-if="tapestryLoaded && !tapestry.rootId">
        <root-node-button v-if="wpCanEditTapestry" @click="$emit('add-root')" />
        <div v-else style="margin-top: 40vh;">
          The requested tapestry is empty.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex"
import SettingsModal from "./SettingsModal"
import RootNodeButton from "./RootNodeButton"
import TapestryApi from "../services/TapestryAPI"
import { tydeTypes } from "@/utils/constants"
import Loading from "@/components/Loading"

export default {
  name: "tapestry",
  components: {
    RootNodeButton,
    SettingsModal,
    Loading,
  },
  data() {
    return {
      tapestryLoaded: false,
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
    changeSelectedNode(event) {
      this.updateSelectedNode(event.detail)
    },
  },
}
</script>
