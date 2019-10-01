<template>
  <div id="tyde">
    <Tapestry />
    <TydeMenu v-if="isMenuOpen" />
  </div>
</template>

<script>
import Tapestry from "./Tapestry"
import TydeMenu from "./tyde/TydeMenu"

export default {
  name: 'tyde',
  components: {
    Tapestry,
    TydeMenu,
  },
  mounted() {
    window.addEventListener("keydown", evt => {
      if (evt.code === "Escape") {
        this.toggleMenu()
      }
    })
  },
  beforeDestroy() {
    window.removeEventListener("keydown")
  },
  data() {
    return {
      isMenuOpen: false,
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    }
  },
}
</script>

<style>
:root {
  --gray: #404040;
  --light-gray: #787878;
  --light-blue: #1eade1;
}
</style>
