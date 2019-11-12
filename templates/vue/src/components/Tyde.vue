<template>
  <div id="tyde">
    <tapestry />
    <!-- Node id defaults to original root node, i.e. first node that was added -->
    <tyde-module v-if="showModule" :node-id="moduleId" />
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
      moduleId: null,
    }
  },
  mounted() {
    window.addEventListener("start-module", evt => {
      this.showModule = !this.showModule
      this.moduleId = evt.detail
    })
  },
}
</script>

<style scoped></style>
