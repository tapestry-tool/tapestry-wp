<template>
  <div id="tyde">
    <Tapestry />
    <TydeMenu v-if="isMenuOpen" :logs="logs" />
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
      logs: [
        {
          name: "Log 1",
          type: "activity",
          isFavourite: false
        },
        {
          name: "Log 2",
          type: "content",
          isFavourite: true
        },
        {
          name: "Log 3",
          type: "activity",
          isFavourite: true
        },
      ],
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
  --med-gray: #535353;
  --light-blue: #1eade1;
}
</style>
