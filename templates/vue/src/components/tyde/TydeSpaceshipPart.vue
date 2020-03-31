<template>
  <div
    id="tyde-spaceship-part"
    :style="style"
    @mouseover="state = 'hover'"
    @mouseleave="state = 'normal'"
    @click="$emit('click')"
  ></div>
</template>

<script>
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
    img() {
      if (this.node.tydeProgress !== 11) {
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
    style() {
      return {
        backgroundImage: `url(${this.img})`,
        top: this.node.typeData.spaceshipPartY + "px",
        left: this.node.typeData.spaceshipPartX + "px",
        height: this.node.typeData.spaceshipPartHeight + "px",
        width: this.node.typeData.spaceshipPartWidth + "px",
        cursor: this.node.tydeProgress === 1 ? "pointer" : "default",
      }
    },
  },
}
</script>

<style lang="scss" scoped>
#tyde-spaceship-part {
  position: absolute;
  background-size: cover;
  background-position: center;
}
</style>
