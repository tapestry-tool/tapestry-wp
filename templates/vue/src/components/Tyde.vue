<template>
  <div id="tyde">
    <Tapestry />
    <TydeMenu @continue="continueTapestry" @return-to-map="returnToMap" v-if="isMenuOpen" :logs="logs" />
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
        if (this.isMenuOpen) {
          // if open, reopen lightbox
          thisTapestryTool.openLightbox(this.lightbox)
        } else {
          thisTapestryTool.closeLightbox(this.lightbox)
        }
        this.toggleMenu()
      }
    })
    window.addEventListener("tyde-open-lightbox", this.saveLightbox)
    window.addEventListener("tyde-close-lightbox", this.clearLightbox)
  },
  beforeDestroy() {
    window.removeEventListener("keydown")
    window.removeEventListener("tyde-open-lightbox")
    window.removeEventListener("tyde-close-lightbox")
  },
  data() {
    return {
      isMenuOpen: false,
      lightbox: null,
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
    continueTapestry() {
      thisTapestryTool.openLightbox(this.lightbox)
      this.toggleMenu()
    },
    clearLightbox() {
      this.lightbox = null
      console.log("Clearing", this.lightbox)
    },
    returnToMap() {
      this.clearLightbox()
      this.toggleMenu()
    },
    saveLightbox(event) {
      const el = event.detail
      this.lightbox = el.dataset
      console.log("Saving", this.lightbox)
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
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
