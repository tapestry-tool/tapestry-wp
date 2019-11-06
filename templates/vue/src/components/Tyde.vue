<template>
  <div id="tyde">
    <tapestry />
    <!-- Node id defaults to original root node, i.e. first node that was added -->
    <tyde-module v-if="showModule" :node-id="originalRootNode" />
  </div>
</template>

<script>
import Tapestry from "./Tapestry"
import TydeModule from "./tyde/TydeModule"

export default {
  name: "tyde",
  components: {
    Tapestry,
    TydeModule,
  },
  data() {
    return {
      showModule: false,
    }
  },
  computed: {
    originalRootNode() {
      return this.$store.state.nodes[0].id
    },
  },
  mounted() {
    // temp for dev purposes
    window.addEventListener("keydown", evt => {
      if (evt.code === "Escape") {
        this.showModule = !this.showModule
      }
    })
  },
}
</script>

<style scoped></style>
