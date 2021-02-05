<template>
  <div
    id="tyde-spaceship-part"
    data-qa="tyde-spaceship-part"
    :style="style"
    @mouseover="state = 'hover'"
    @mouseleave="state = 'normal'"
    @click="$emit('click')"
  ></div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  name: "tyde-spaceship-part",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      state: "normal",
    }
  },
  computed: {
    ...mapGetters(["getTydeProgress"]),
    tydeProgress() {
      return this.getTydeProgress(this.node.id)
    },
    img() {
      if (this.tydeProgress === 1 || this.isCopilot) {
        switch (this.state) {
          case "hover":
            return this.node.typeData.spaceshipPartHoverIconUrl
          default:
            return this.node.typeData.spaceshipPartEarnedIconUrl
        }
      } else {
        return this.node.typeData.spaceshipPartNotEarnedIconUrl
      }
    },
    isCopilot() {
      return this.node.userType === "teen"
    },
    style() {
      return {
        backgroundImage: `url(${this.img})`,
        top: this.node.typeData.spaceshipPartY + "%",
        left: this.node.typeData.spaceshipPartX + "%",
        height: this.node.typeData.spaceshipPartHeight + "%",
        width: this.node.typeData.spaceshipPartWidth + "%",
        cursor: this.tydeProgress === 1 || this.isCopilot ? "pointer" : "default",
      }
    },
  },
}
</script>

<style lang="scss" scoped>
#tyde-spaceship-part {
  cursor: pointer;
  position: absolute;
  background-size: cover;
  background-position: center;
}
</style>
