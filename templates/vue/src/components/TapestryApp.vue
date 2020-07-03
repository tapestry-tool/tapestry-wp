<template>
  <loading v-if="loading"></loading>
  <main v-else>
    <root-node-button
      v-if="!rootId && canEdit"
      @click="addRootNode"
    ></root-node-button>
    <tapestry-svg></tapestry-svg>
    <t-toolbar></t-toolbar>
  </main>
</template>

<script>
import { mapMutations, mapState } from "vuex"
import Loading from "@/components/Loading"
import TapestrySvg from "@/components/TapestrySvg"
import TToolbar from "@/components/TToolbar"
import RootNodeButton from "@/components/RootNodeButton"
import TapestryApi from "@/services/TapestryAPI"

const client = new TapestryApi(wpPostId)

export default {
  components: {
    Loading,
    TapestrySvg,
    TToolbar,
    RootNodeButton,
  },
  data() {
    return {
      loading: true,
    }
  },
  computed: {
    ...mapState(["tapestryIsLoaded", "rootId"]),
    canEdit() {
      return wpApiSettings && wpApiSettings.wpCanEditTapestry === "1"
    },
  },
  mounted() {
    client.getTapestry().then(dataset => {
      this.init(dataset)
      this.loading = false
    })
  },
  methods: {
    ...mapMutations(["init"]),
    addRootNode() {
      this.$root.$emit("add-node", null)
    },
  },
}
</script>

<style lang="scss" scoped>
main {
  position: relative;
}
</style>
