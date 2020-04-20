<template>
  <div class="star-celebration">
    <tapestry-modal
      :allow-close="true"
      :content-container-style="celebrationStyles"
    ></tapestry-modal>
  </div>
</template>

<script>
import Unlock from "@/assets/tyde-unlock.gif"
import Helpers from "@/utils/Helpers"
import TapestryModal from "../TapestryModal"

export default {
  name: "tyde-star-celebration",
  components: {
    TapestryModal,
  },
  computed: {
    celebrationStyles() {
      return {
        backgroundColor: "white",
        backgroundImage: `url(${Helpers.getImagePath(Unlock)})`,
        backgroundOrigin: "content-box",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        padding: "32px 32px",
        top: "150px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "400px",
        height: "400px",
      }
    },
  },
  mounted() {
    let audio = new Audio(Helpers.getImagePath("@/assets/tyde-unlock-sound.wav"))
    audio.play()
  },
}
</script>

<style lang="scss" scoped></style>
