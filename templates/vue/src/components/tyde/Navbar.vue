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
      icon-class="fas fa-cog fa-s"
      class="user-settings-button"
    ></user-settings-button>
  </div>
</template>

<script>
import { mapState } from "vuex"
import TydeIcon from "./TydeIcon.vue"
import UserSettingsButton from "../Toolbar/UserSettingsButton"
import * as wp from "@/services/wp"

export default {
  name: "navbar",
  components: {
    TydeIcon,
    UserSettingsButton,
  },
  data() {
    return {
      selectedTab: "default",
    }
  },
  computed: {
    ...mapState(["settings"]),
    tabs() {
      return ["default", "profile", "goals", "cos"]
    },
    avatarsEnabled() {
      return wp.isLoggedIn() && process.env.VUE_APP_AVATARS === "TRUE"
    },
  },
  methods: {
    handleTabChange(tab) {
      this.$emit("change-tab", tab)
      this.selectedTab = tab
    },
    isSelectedTab(tab) {
      return this.selectedTab === tab
    },
  },
}
</script>

<style lang="scss" scoped>
.nav-container {
  width: 100vw;
  z-index: 9999;
  position: fixed !important;
  top: 40px;
  left: 0;

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
