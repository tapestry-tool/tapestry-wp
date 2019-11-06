<template>
  <div id="tyde">
    <tapestry />
    <!-- Change node id to whatever the module id is -->
    <tyde-module v-if="showModule" node-id="5517" />
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
