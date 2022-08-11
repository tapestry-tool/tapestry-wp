<template>
  <transition name="fade">
    <line
      v-show="show"
      :data-qa="`link-${source.id}-${target.id}`"
      :class="{
        opaque:
          !visibleNodes.includes(source.id) || !visibleNodes.includes(target.id),
        disabled: !isLoggedIn,
      }"
      :x1="source.coordinates.x"
      :x2="target.coordinates.x"
      :y1="source.coordinates.y"
      :y2="target.coordinates.y"
      @click="openLinkModal"
    ></line>
  </transition>
</template>

<script>
import { mapGetters, mapState } from "vuex"
import { names } from "@/config/routes"
import * as wp from "@/services/wp"

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
  },
  computed: {
    ...mapState(["visibleNodes", "rootId"]),
    ...mapGetters(["getNeighbours", "isVisible"]),
    show() {
      return this.isVisible(this.source.id) && this.isVisible(this.target.id)
    },
    isLoggedIn() {
      return wp.isLoggedIn()
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
line {
  stroke: #999;
  stroke-width: 6;

  &:hover {
    cursor: pointer;
    stroke: #3498db;
    stroke-width: 11;
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
