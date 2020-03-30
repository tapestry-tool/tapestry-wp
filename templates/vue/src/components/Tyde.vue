<template>
  <div id="tyde">
    <tapestry />
    <tyde-module-summary
      v-if="showModule"
      :node-id="moduleId"
      @done="showModule = false"
    />
    <tyde-module v-if="showModule" :node-id="moduleId" @done="showModule = false" />
    <tyde-spaceship @return-to-map="showModule = false" />
  </div>
</template>

<script>
import Tapestry from "./Tapestry"
import TydeModule from "./tyde/TydeModule"
import TydeModuleSummary from "./tyde/TydeModuleSummary"
import TydeSpaceship from "./tyde/TydeSpaceship"

export default {
  name: "tyde",
  components: {
    Tapestry,
    TydeModule,
    TydeModuleSummary,
    TydeSpaceship,
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

<style>
:root {
  --tapestry-gray: #404040;
  --tapestry-light-gray: #787878;
  --tapestry-med-gray: #535353;
  --tapestry-light-blue: #1eade1;
  --tyde-green: #205a27;
  --tyde-border-green: #39b54a;
  --tyde-font-mono: "VT323", monospace;
}
</style>
