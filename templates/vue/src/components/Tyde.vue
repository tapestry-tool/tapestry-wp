<template>
  <div id="tyde">
    <tapestry-app />
    <tyde-module
      v-if="selectedModuleId"
      :node-id="selectedModuleId"
      @done="closeModule"
    />
    <tyde-spaceship @return-to-map="showModule = false" />
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex"
import TapestryApp from "./TapestryApp"
import TydeModule from "./tyde/TydeModule"
import TydeSpaceship from "./tyde/TydeSpaceship"
import client from "@/services/TapestryAPI"
import "../tyde.scss"

export default {
  name: "tyde",
  components: {
    TapestryApp,
    TydeModule,
    TydeSpaceship,
  },
  computed: {
    ...mapState(["selectedModuleId"]),
  },
  methods: {
    ...mapMutations(["updateSelectedModule"]),
    closeModule() {
      client.recordAnalyticsEvent("app", "close", "module", this.moduleId)
      this.updateSelectedModule(null)
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
