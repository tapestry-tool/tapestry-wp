<template>
  <transition name="fade">
    <polygon
      v-show="show"
      :id="`link-${source.id}-${target.id}`"
      :aria-label="
        `Link from ${source.title} to ${target.title}. To edit this link, press Enter. To go to the source node ${source.title}, press the Up Arrow Key. To go to the target node ${target.title}, press the Down Arrow Key. To go to a sibling link, press the Left or Right Arrow Key. To exit the Main Tapestry view, press the Q Key or the Escape Key.`
      "
      :data-qa="`link-${source.id}-${target.id}`"
      :class="{
        'half-opaque':
          (!source.accessible && source.hideWhenLocked) ||
          (!target.accessible && target.hideWhenLocked),
        opaque:
          !visibleNodes.includes(source.id) || !visibleNodes.includes(target.id),
        disabled: !isLoggedIn,
      }"
      :style="{
        filter: `drop-shadow(${4 * (maxLevel - source.level) * scale}px ${4 *
          (maxLevel - source.level) *
          scale}px ${Math.max(10 - source.level, 4)}px rgba(0, 0, 0, ${Math.max(
          0.5 - source.level * 0.05,
          0.2
        )}))`,
      }"
      :points="polygonPoints"
      @click="openLinkModal"
    ></polygon>
  </transition>
</template>

<script>
import { mapGetters, mapState } from "vuex"
import { names } from "@/config/routes"
import * as wp from "@/services/wp"
import Helpers from "@/utils/Helpers"

export default {
  name: "tapestry-link",
  props: {
    source: {
      type: Object,
      required: true,
    },
    target: {
      type: Object,
      required: true,
    },
    scale: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapState(["visibleNodes", "maxLevel", "currentDepth"]),
    ...mapGetters(["getNeighbours", "isVisible"]),
    show() {
      return (
        this.isVisible(this.source.id) &&
        Helpers.getNodeVisibility(
          this.source.level,
          this.scale,
          this.currentDepth
        ) >= 0 &&
        this.isVisible(this.target.id) &&
        Helpers.getNodeVisibility(
          this.target.level,
          this.scale,
          this.currentDepth
        ) >= 0
      )
    },
    isLoggedIn() {
      return wp.isLoggedIn()
    },
    polygonPoints() {
      return Helpers.getLinePolygonPoints(this.source, this.target, this.scale)
    },
  },
  methods: {
    openLinkModal() {
      this.$router.push({
        name: names.LINKMODAL,
        params: {
          source: this.source.id,
          target: this.target.id,
        },
        query: this.$route.query,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
polygon {
  fill: #999;

  &:hover {
    cursor: pointer;
    fill: #3498db;
  }

  &.opaque {
    opacity: 0.2;
  }

  &.disabled {
    &:hover {
      cursor: not-allowed;
      fill: #999;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.half-opaque {
  opacity: 0.6;
}

.opaque {
  opacity: 0.2;
}

.disabled {
  &:hover {
    cursor: not-allowed;
    stroke: #999;
    stroke-width: 6;
  }
}
</style>
