<template>
  <div class="nav-container">
    <b-navbar tyde="light" class="navbar">
      <b-navbar-nav class="mx-auto" fill style="width:100%;">
        <b-nav-item
          v-for="tab in tabs"
          :key="tab"
          :ref="tab + '-tab'"
          active-class="active"
          link-classes="link"
          :active="selectedTab === tab"
          @click="$emit('change-tab', tab)"
        >
          <tyde-icon :selected="selectedTab === tab" :icon="tab" />
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<script>
import { mapState } from "vuex"
import TydeIcon from "./TydeIcon.vue"

export default {
  name: "navbar",
  components: {
    TydeIcon,
  },
  props: {
    selectedTab: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState(["settings"]),
    tabs() {
      return ["tyde", "profile", "goals", "cos"]
    },
  },
}
</script>

<style lang="scss">
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
