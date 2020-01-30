<template>
  <div>
    <input
      id="tyde-backpack-icon"
      type="image"
      :src="backpackUrl"
      @click="toggleMenu"
    />
    <tyde-menu
      v-if="isMenuOpen"
      @audio-change="toggleAudio"
      @continue="continueTapestry"
      @return-to-map="returnToMap"
    />
  </div>
</template>

<script>
import TydeMenu from "./TydeMenu"
import BackpackIcon from "@/assets/backpack.svg"
import { mapState } from "vuex"

const TYDE_BACKGROUND_AUDIO_SRC =
  "https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3" // test file

export default {
  name: "tyde-backpack",
  components: {
    TydeMenu,
  },
  data() {
    return {
      backgroundAudio: new Audio(TYDE_BACKGROUND_AUDIO_SRC),
      isMenuOpen: false,
      escMenuOpenListener: null,
    }
  },
  async mounted() {
    this.escMenuOpenListener = window.addEventListener("keydown", evt => {
      if (evt.code === "Escape") {
        if (this.lightbox) {
          if (
            this.isMenuOpen &&
            this.lightbox.currentTime < this.lightbox.duration
          ) {
            this.lightbox.play()
          } else {
            this.lightbox.pause()
          }
        }
        this.toggleMenu()
      }
    })
    this.backgroundAudio.loop = true
  },
  computed: {
    ...mapState(["lightbox"]),
    backpackUrl() {
      return `${wpData.vue_uri}/${BackpackIcon.split("dist")[1]}`
    },
  },
  beforeDestroy() {
    window.removeEventListener(this.escMenuOpenListener)
  },
  methods: {
    continueTapestry() {
      this.toggleMenu()
      if (this.lightbox) {
        if (this.lightbox.currentTime < this.lightbox.duration) {
          this.lightbox.play()
        }
      }
    },
    returnToMap() {
      this.$router.push("/")
      this.toggleMenu()
      this.$emit("return-to-map")
    },
    toggleAudio() {
      if (this.backgroundAudio.paused) {
        this.backgroundAudio.play()
      } else {
        this.backgroundAudio.pause()
      }
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
  },
}
</script>

<style lang="scss" scoped>
#tyde-backpack-icon {
  position: absolute;
  top: 0px;
  right: 5%;
  max-width: 140px;
  outline: none;
}
</style>
