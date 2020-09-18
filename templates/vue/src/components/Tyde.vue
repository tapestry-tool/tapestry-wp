<template>
  <div id="tyde">
    <tapestry @add-root="$emit('add-root')" />
    <tyde-module v-if="showModule" :node-id="moduleId" @done="closeModule" />
    <tyde-spaceship @return-to-map="showModule = false" />
  </div>
</template>

<script>
import Tapestry from "./Tapestry"
import TydeModule from "./tyde/TydeModule"
import TydeSpaceship from "./tyde/TydeSpaceship"
import "../tyde.scss"

export default {
  name: "tyde",
  components: {
    Tapestry,
    TydeModule,
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
      this.$store.commit("updateSelectedModule", this.moduleId)
    })
  },
  methods: {
    closeModule() {
      globals.recordAnalyticsEvent("app", "close", "module", this.moduleId)
      this.showModule = false
    },
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
  --tyde-font-mono: "Roboto", monospace;
  --tyde-orange: #f79621;
  --tyde-orange-light: #f9b664;
  --tyde-blue: #1074bb;
}
</style>
