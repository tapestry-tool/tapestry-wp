<template>
  <div>
    <div
      id="tyde-spaceship-part"
      :style="moduleStyles"
      @mouseover="partMouseOverHandler()"
      @mouseleave="partMouseLeaveHandler()"
      @click="openSummary"
    ></div>
    <tapestry-modal
      v-if="showSummary"
      :content-container-style="{
        top: '10vh',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '65vw',
        height: '70vh',
        color: 'white',
      }"
      @close="showSummary = false"
    >
      <div class="summary-container">
        <tyde-module-summary :node-id="node.id"></tyde-module-summary>
      </div>
    </tapestry-modal>
  </div>
</template>

<script>
import TapestryModal from "@/components/TapestryModal"
import TydeModuleSummary from "@/components/tyde/TydeModuleSummary"

export default {
  name: "tyde-spaceship-part",
  components: {
    TapestryModal,
    TydeModuleSummary,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      img: this.moduleImage(this.node),
      showSummary: false,
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
        this.img = this.node.typeData.spaceshipPartHoverIconUrl
      }
    },
    partMouseLeaveHandler() {
      this.img = this.moduleImage()
    },
    openSummary() {
      if (this.node.tydeProgress === 1) {
        this.showSummary = true
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

.summary-container {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
}
</style>
