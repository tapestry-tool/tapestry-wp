<template>
  <div class="progress-wrapper">
    <div :style="outerCSS">
      <div :style="innerCSS"></div>
      <img
        v-for="n in incompleteStages"
        :key="n"
        :style="starStyle(n)"
        :src="inactiveStarSrc"
      />
      <img
        v-for="m in range(incompleteStages + 1, incompleteStages + completeStages)"
        :key="m"
        :style="starStyle(m)"
        :src="activeStarSrc"
      />
    </div>
    <div class="tyde-part-icon" :style="iconCSS">
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
    ...mapGetters(["getNode", "getDirectChildren"]),
    node() {
      return this.getNode(this.nodeId)
    },
    progress() {
      return this.node.tydeProgress
    },
    stages() {
      return this.getDirectChildren(this.nodeId)
        .map(n => this.getNode(n))
        .filter(n => n.tydeType === tydeTypes.STAGE)
    },
    incompleteStages() {
      return this.stages.filter(n => n.tydeProgress < 1).length
    },
    completeStages() {
      return this.stages.filter(n => n.tydeProgress === 1).length
    },
    height() {
      return 30
    },
    width() {
      const starBasedWidth = this.stages.length * 100
      return Math.min(400, Math.max(150, starBasedWidth))
    },
    outerCSS() {
      return {
        width: this.width + "px",
        height: this.height + "px",
        "--bar-height": this.height + "px",
      }
    },
    innerCSS() {
      return {
        width: this.progress * 100 + "%",
        // height: this.height  + "px",
      }
    },
    iconCSS() {
      return {
        height: this.height + 40 + "px",
        width: this.height + 40 + "px",
        background: this.progress === 1 ? "var(--tapestry-light-blue)" : "gray",
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
      const increment = 1 / this.stages.length
      var rightPos = (k - 1) * increment * this.width - (this.height + 6) / 2
      return {
        height: this.height + 6 + "px",
        width: this.height + 6 + "px",
        right: rightPos + "px",
      }
    },
    range(start, end) {
      return Helpers.range(start, end)
    },
  },
}
</script>

<style lang="scss" scoped>
$hh: 30px;

.progress-wrapper {
  display: flex;
  align-items: center;

  .tyde-part-icon {
    border-radius: 50%;
    margin-left: 10px;

    > img {
        position: absolute;
        width: 85%;
        top: 7.5%;
        left: 7.5%;
    }
  }

  > div {
    background: gray;
    border: solid 2px lightgray;
    min-height: 3vh;
    margin-left: 30px;
    border-radius: 8px;
    position: relative;
    overflow: hidden;

    > div {
      background: var(--tapestry-light-blue);
      border-radius: 8px;
      height: 101%;
    }

    > img {
      position: absolute;
      padding-bottom: 3px;
      top: 0px;
    }
  }
}
</style>
