<template>
  <div class="progress-wrapper">
    <div :style="outerCSS">
      <div :style="innerCSS"></div>
    </div>
    <div class="tyde-part-icon" :style="iconCSS"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  name: "tyde-progress-bar",
  props: {
    nodeId: {
      type: [Number, String],
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    progress: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getNode", "getDirectChildren"]),
    node() {
      return this.getNode(this.nodeId)
    },
    numChildren() {
      return this.getDirectChildren(this.nodeId).length()
    },
    height() {
      return this.width / 6
    },
    outerCSS() {
      return {
        width: this.width + "px",
        height: this.height + "px",
      }
    },
    innerCSS() {
      return {
        width: this.progress * 100 + "%",
        height: this.height + "px",
      }
    },
    iconCSS() {
      // cssObject = {
      //     height: (this.height + 10) + 'px',
      //     width: (this.height + 10) + 'px'
      // }
      // // if(this.progress === 1){
      // //     cssObject.background = "var(--tapestry-light-blue)"
      // // }
      // return cssObject
      return {
        height: this.height + 40 + "px",
        width: this.height + 40 + "px",
        background: this.progress === 1 ? "var(--tapestry-light-blue)" : "gray",
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.progress-wrapper {
  display: flex;
  align-items: center;

  .tyde-part-icon {
    border-radius: 50%;
    margin-left: 10px;
  }

  > div {
    background: gray;
    border: solid 2px lightgray;
    min-height: 3vh;
    margin-left: 30px;
    border-radius: 8px;
    overflow: hidden;

    > div {
      background: var(--tapestry-light-blue);
      border-radius: 8px;
    }
  }
}
</style>
