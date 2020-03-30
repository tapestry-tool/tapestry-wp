<template>
  <div
    id="tyde-spaceship-part"
    :style="moduleStyles"
    @mouseover="partMouseOverHandler()"
    @mouseleave="partMouseLeaveHandler()"
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
      img: this.moduleImage(this.node),
    }
  },
  computed: {
    moduleStyles() {
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
  methods: {
    moduleImage() {
      if (this.node.tydeProgress === 1) {
        return this.node.typeData.spaceshipPartEarnedIconUrl
      } else {
        return this.node.typeData.spaceshipPartNotEarnedIconUrl
      }
    },
    partMouseOverHandler() {
      if (this.node.tydeProgress === 1) {
        this.img = this.node.typeData.spaceShipPartHoverIconUrl
      }
    },
    partMouseLeaveHandler() {
      this.img = this.moduleImage()
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
