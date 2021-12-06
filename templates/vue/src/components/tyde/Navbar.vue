<template>
  <div class="nav-container">
    <b-navbar tyde="light" class="navbar">
      <b-navbar-nav class="mx-auto" fill style="width:100%;">
        <b-nav-item
          v-for="(tab, index) in tabs"
          :key="tab"
          :ref="tab + '-tab'"
          active-class="active"
          link-classes="link"
          :active="selectedTab === tab"
          @click="handleTabChange(tab)"
        >
          <tyde-icon
            :selected="isSelectedTab(tab)"
            :icon="tab"
            :is-last="index === tabs.length - 1"
            :inline-tooltips="!isCompact"
          />
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>
    <user-settings-button
      v-if="!canEditTapestry"
      icon-class="fas fa-cog fa-s"
      class="user-settings-button"
    ></user-settings-button>
  </div>
</template>

<script>
import { mapState } from "vuex"
import TydeIcon from "./TydeIcon.vue"
import UserSettingsButton from "../Toolbar/UserSettingsButton"
import { names } from "@/config/routes"
import Helpers from "@/utils/Helpers"
import { getCurrentUser, canEditTapestry } from "@/services/wp"

export default {
  name: "navbar",
  components: {
    TydeIcon,
    UserSettingsButton,
  },
  data() {
    return {
      defaultTabNodeId: null,
    }
  },
  computed: {
    ...mapState(["settings", "rootId"]),
    selectedTab() {
      if (this.$route.query.tab && this.tabs.includes(this.$route.query.tab)) {
        return this.$route.query.tab
      }
      const currentNodeId = this.$route.params.nodeId
      if (currentNodeId && this.settings.tydeModeTabs) {
        const tabName = Object.keys(this.settings.tydeModeTabs).find(
          key => this.settings.tydeModeTabs[key] === currentNodeId
        )
        return tabName || "default"
      }
      return "default"
    },
    tabs() {
      return ["default", "profile", "goals", "cos"]
    },
    canEditTapestry() {
      return canEditTapestry()
    },
    isCompact() {
      return Helpers.getBrowserWidth() < 550 + this.tabs.length * 150
    },
  },
  methods: {
    handleTabChange(tab) {
      let selectedNodeId = this.defaultTabNodeId
      if (tab !== "default") {
        if (this.selectedTab === "default") {
          this.defaultTabNodeId = this.$route.params.nodeId
        }
        if (tab !== "cos") {
          selectedNodeId = this.settings.tydeModeTabs[tab]
        }
      }

      if (selectedNodeId) {
        this.$router.push({
          name: names.LIGHTBOX,
          params: { nodeId: selectedNodeId },
          query: { ...this.$route.query, tab: tab === "cos" ? tab : undefined },
        })
      }
    },
    isSelectedTab(tab) {
      return this.selectedTab === tab
    },
  },
}
</script>

<style lang="scss" scoped>
.nav-container {
  z-index: 9999;
  position: fixed !important;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);

  .navbar {
    min-width: 250px;
    max-width: 750px;
    margin: 0 auto;
    width: calc(100vw - 550px);
    border-radius: 30px;
    border: solid 2px #c4e4ea;
    background-color: whitesmoke;

    .active::after {
      content: "";
      display: block;
      position: relative;
      top: 10px;
      border: 2px solid #4197ac;
      margin: 0 auto;
      max-width: 55px;
    }

    .link {
      padding: 0 !important;
    }
  }
  .user-settings-button {
    position: absolute;
    top: 3px;
    right: -4em;
    background: #fff !important;
    padding: 0.5em 0.75em !important;
    border-radius: 100%;
    border: solid 2px #c4e4ea;

    @media screen and (max-width: 670px) {
      right: 1em;
    }
  }
}
</style>
