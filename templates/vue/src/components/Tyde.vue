<template>
  <div id="tyde">
    <Tapestry />
    <TydeMenu v-if="isMenuOpen" />
  </div>
</template>

<script>
import Tapestry from "./Tapestry"
import TydeMenu from "./TydeMenu"

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
      isMenuOpen: false
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    }
  }
}
</script>

<style scoped>

</style>
