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
      return "default"
    },
    tabs() {
      return ["default", "profile", "goals", "cos"]
    },
    defaultTabBaseNodeId() {
      let defaultNodeId = this.rootId
      if (this.settings.tydeModeTabs.default) {
        let userMainRole = getCurrentUser().roles[0]
        if (!userMainRole || !(userMainRole in this.settings.tydeModeTabs.default)) {
          userMainRole = "public"
        }
        defaultNodeId = this.settings.tydeModeTabs.default[userMainRole]
      }
      return defaultNodeId
    },
    canEditTapestry() {
      return canEditTapestry()
    },
  },
  mounted() {
    if (this.selectedTab === "default") {
      this.defaultTabNodeId = this.$route.params.nodeId
    } else {
      this.defaultTabNodeId = this.defaultTabBaseNodeId
    }
    this.handleTabChange(this.selectedTab)
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
        this.$router.replace({
          name: names.LIGHTBOX,
          params: { nodeId: selectedNodeId },
          query: { ...this.$route.query, tab },
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
    max-width: 900px;
    margin: 0 auto;
    width: 75vw;
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
    right: 2em;
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
