<template>
  <div class="nav-container">
    <b-navbar tyde="light" class="navbar">
      <b-navbar-nav class="mx-auto" fill style="width:100%;">
        <b-nav-item :to="tydeMode.defaultNode" active active-class="active">
          TYDE
        </b-nav-item>
        <b-nav-item href="#" active-class="active">Profile</b-nav-item>
        <b-nav-item href="#" active-class="active">Goals</b-nav-item>
        <b-nav-item href="#" active-class="active">COS</b-nav-item>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<script>
import { mapState } from "vuex"
export default {
  name: "navbar",
  computed: {
    ...mapState(["tydeMode"]),
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
  max-width: 1050px;
  margin: 0 auto;
  width: 75vw;

  border-radius: 30px;
  border: solid 2px #c4e4ea;

  background-color: whitesmoke;
}
.active::after {
  content: "";
  display: block;
  border: 1px solid #4197ac;
  margin: 0 auto;
  max-width: 50px;
}
</style>
