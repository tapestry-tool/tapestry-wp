<template>
  <div class="nav-container">
    <b-navbar tyde="light" class="navbar">
      <b-navbar-nav class="mx-auto" fill style="width:100%;">
        <b-nav-item
          v-for="tab in tabs"
          :key="tab.name"
          :ref="tab.name + '-tab'"
          :to="tab.link"
          active-class="active"
          link-classes="link"
        >
          <tyde-icon class="selected" :icon="tab.name" />
          <tyde-icon class="unselected" :icon="tab.name + '-unselected'" />
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<script>
import { mapState } from "vuex"
import { names } from "@/config/routes"
import TydeIcon from "./TydeIcon.vue"
import { getCurrentUser } from "@/services/wp"

const currentUser = getCurrentUser()

export default {
  name: "navbar",
  components: {
    TydeIcon,
  },
  data() {
    return {}
  },

  computed: {
    ...mapState(["settings", "tydeMode"]),
    tabs() {
      /* NOTE: Opening the default Node for a specific role 
             in fullscreen only if this role cannot edit the 
             default node, otherwise the regular tapestry will
             open
      */

      const userMainRole = currentUser.roles[0] || "public"
      const defaultNodeId = this.settings.tydeModeDefualtNodes[userMainRole]
      return [
        {
          name: "tyde",
          link: {
            name: names.LIGHTBOX,
            params: { nodeId: defaultNodeId },
            query: this.$route.query,
          },
        },
        {
          name: "profile",
          link: "#",
        },
        {
          name: "goals",
          link: "#",
        },
        {
          name: "cos",
          link: "#",
        },
      ]
    },
  },
  created() {
    this.$router.push(this.tabs[0].link)
  },
}
</script>

<style lang="scss">
.navbar-nav {
  .active > .unselected {
    display: none;
  }
  :not(.active) > .selected {
    display: none;
  }
}
.nav-container {
  width: 100%;
  z-index: 9999;
  position: fixed !important;
  top: 20px;
  left: auto;
}
.navbar {
  min-width: 250px;
  max-width: 900px;
  margin: 0 auto;
  width: 75vw;

  border-radius: 30px;
  border: solid 2px #c4e4ea;

  background-color: whitesmoke;
}
.link {
  padding: 0 !important;
}
.nav-container .active::after {
  content: "";
  display: block;
  position: relative;
  top: 10px;
  border: 2px solid #4197ac;
  margin: 0 auto;
  max-width: 55px;
}
</style>
