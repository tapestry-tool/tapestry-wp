<template>
  <div id="tyde-menu">
    <div class="buttons">
      <tyde-button
        icon="cog"
        label="Settings"
        @click="setActivePage('settings')"
      ></tyde-button>
      <tyde-button
        icon="globe-asia"
        label="Map"
        @click="$emit('return-to-map')"
      ></tyde-button>
      <tyde-button
        icon="question"
        label="Help"
        @click="setActivePage('help')"
      ></tyde-button>
      <tyde-button
        icon="user-circle"
        label="Profile"
        @click="setActivePage('profile')"
      ></tyde-button>
      <tyde-button
        icon="space-shuttle"
        class="cockpit-button"
        label="Cockpit"
        @click="setActivePage('home')"
      ></tyde-button>
      <tyde-button
        class="close-button"
        icon="times"
        @click="$emit('continue')"
      ></tyde-button>
    </div>
    <div class="content">
      <tyde-cockpit
        v-if="activePage === 'home' && !showSummary"
        @close="$emit('continue')"
        @show-summary="openSummary"
      />
      <tyde-module-summary
        v-if="activePage === 'home' && showSummary"
        :node-id="moduleId"
        style="margin-bottom: 32px;"
        @close="showSummary = false"
      />
      <tyde-menu-settings
        v-if="activePage === 'settings'"
        :settings="settings"
        @settings-change="updateSettings"
      />
      <tyde-menu-help v-if="activePage === 'help'" />
      <tyde-menu-profile
        v-if="activePage === 'profile'"
        @back="setActivePage('home')"
      />
    </div>
  </div>
</template>

<script>
import TydeButton from "./TydeButton"
import TydeCockpit from "./TydeCockpit"
import { mapState, mapGetters } from "vuex"
import TydeMenuSettings from "./TydeMenuSettings"
import TydeMenuHelp from "./TydeMenuHelp"
import TydeMenuProfile from "./TydeMenuProfile"
import TydeModuleSummary from "./TydeModuleSummary"

export default {
  name: "tyde-menu",
  components: {
    TydeButton,
    TydeCockpit,
    TydeMenuSettings,
    TydeMenuHelp,
    TydeMenuProfile,
    TydeModuleSummary,
  },
  data() {
    return {
      activePage: "home",
      showSummary: false,
      moduleId: null,
      settings: {
        isAudioPlaying: false,
      },
    }
  },
  computed: {
    ...mapState(["nodes"]),
    ...mapGetters(["getNode"]),
  },
  watch: {
    settings(newSettings, prevSettings) {
      if (newSettings.isAudioPlaying !== prevSettings.isAudioPlaying) {
        this.$emit("audio-change")
      }
    },
  },
  methods: {
    setActivePage(page) {
      this.activePage = page
    },
    openSummary(nodeId) {
      const node = this.getNode(nodeId)
      if (node.tydeProgress === 1 || node.userType === "teen") {
        this.showSummary = true
        this.moduleId = nodeId
      }
    },
    updateSettings(partialNewSettings) {
      this.settings = { ...this.settings, ...partialNewSettings }
    },
  },
}
</script>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css?family=Roboto:400,400i,700&display=swap");

#tyde-menu {
  width: 100vw;
  height: 100vh;
  position: fixed;
  text-align: left;
  top: 0;
  left: 0;
  background: black;
  color: white;
  z-index: 200;
  padding: 16px 15px;

  * {
    font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  .buttons {
    width: 100%;
    display: flex;
    margin-bottom: 10px;
  }

  .content {
    background: var(--tapestry-gray);
    border: 4px var(--tapestry-gray);
    border-radius: 20px;
    height: calc(100vh - 86px);
    overflow-y: scroll;
    padding: 16px 32px;
    position: relative;
    z-index: 0;

    h1 {
      position: absolute;
      right: 2.5em;
      top: -78px;
      padding: 16px 3em;
      line-height: 44px;
      margin: 0;
      font-weight: 900;
      font-size: 30px;
      text-transform: uppercase;
      z-index: 10;

      &:before {
        display: none;
      }

      &:after {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        padding: 16px 3em;
        background: var(--tapestry-gray);
        border: 4px solid white;
        border-bottom: 4px solid var(--tapestry-gray);
        transform: perspective(10px) rotateX(1deg);
        z-index: -1;
      }
    }
  }

  .cockpit-button {
    position: absolute;
    right: 80px;
    top: 17px;
    z-index: 10;
  }

  .close-button {
    position: absolute;
    right: 15px;
    top: 17px;
    z-index: 10;
    width: 60px !important;
    border-radius: 50% !important;
  }

  .close-button::after {
    content: "" !important;
  }
}
</style>
