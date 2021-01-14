<template>
  <div class="progress-wrapper">
    <div class="bar-wrapper">
      <div class="outer-progress" :style="outerCSS">
        <div class="inner-progress" :style="innerCSS"></div>
        <img
          v-for="index in numIncompleteStages"
          :key="index"
          :style="starStyle(index)"
          :src="inactiveStarSrc"
        />
        <img
          v-for="index in range(numIncompleteStages + 1, stages.length)"
          :key="index"
          :style="starStyle(index)"
          :src="activeStarSrc"
        />
      </div>
    </div>
    <div class="tyde-part-icon">
      <img v-if="progress !== 1" :src="node.typeData.planetViewNotEarnedIconUrl" />
      <img v-else :src="node.typeData.planetViewEarnedIconUrl" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import ActiveStar from "@/assets/star-active.png"
import InactiveStar from "@/assets/star-inactive.png"
import Helpers from "@/utils/Helpers"
import { tydeTypes } from "@/utils/constants"

export default {
  name: "tyde-progress-bar",
  props: {
    nodeId: {
      type: [Number, String],
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getNode", "getDirectChildren", "getTydeProgress"]),
    node() {
      return this.getNode(this.nodeId)
    },
    progress() {
      return this.getTydeProgress(this.nodeId)
    },
    stages() {
      return this.getDirectChildren(this.nodeId)
        .map(n => this.getNode(n))
        .filter(n => n.tydeType === tydeTypes.STAGE)
    },
    numIncompleteStages() {
      return this.stages.filter(n => this.getTydeProgress(n.id) < 1).length
    },
    outerCSS() {
      return {
        width: this.stages.length * 50 + "px",
      }
    },
    innerCSS() {
      return {
        width: this.progress * 100 + "%",
      }
    },
    activeStarSrc() {
      return Helpers.getImagePath(ActiveStar)
    },
    inactiveStarSrc() {
      return Helpers.getImagePath(InactiveStar)
    },
  },
  methods: {
    starStyle(k) {
      return {
        right: k * 50 - 37.5 + "px",
      }
    },
    range(start, end) {
      return Helpers.range(start, end)
    },
  },
}
</script>

<style lang="scss" scoped>
.progress-wrapper {
  display: flex;
  align-items: center;
  position: absolute;

  .tyde-part-icon {
    width: 70px;
    height: 70px;
    position: relative;

    > img {
      position: absolute;
      width: 85%;
      top: 7.5%;
      left: 7.5%;
    }
  }

  .bar-wrapper {
    background: gray;
    border: solid 2px lightgray;
    border-radius: 8px;
    height: 30px;
    position: relative;
    overflow: hidden;

    .outer-progress {
      height: 30px;
      .inner-progress {
        background: var(--tapestry-light-blue);
        height: 100%;
      }

      > img {
        position: absolute;
        padding-bottom: 1px;
        top: 0px;
        z-index: 1;
        width: auto;
        height: 100%;
      }
    }
  }
}
</style>
