<template>
  <transition name="fade">
    <polygon
      v-show="show"
      :data-qa="`link-${source.id}-${target.id}`"
      :class="{
        opaque:
          !visibleNodes.includes(source.id) || !visibleNodes.includes(target.id),
        disabled: !isLoggedIn,
      }"
      :style="{
        filter: `url(#shadow-${source.level})`,
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
    ...mapState(["visibleNodes", "rootId", "maxLevel", "currentDepth"]),
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
      return Helpers.getLinePolygonPoints(
        this.source,
        this.target,
        this.maxLevel,
        this.scale
      )
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
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
