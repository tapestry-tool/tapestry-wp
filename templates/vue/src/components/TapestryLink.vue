<template>
  <line
    v-show="isVisible"
    :class="{
      opaque: !visibleNodes.includes(source.id) || !visibleNodes.includes(target.id),
    }"
    :x1="source.fx"
    :x2="target.fx"
    :y1="source.fy"
    :y2="target.fy"
    stroke="currentColor"
    stroke-width="6"
  ></line>
</template>

<script>
import { mapState, mapGetters } from "vuex"

export default {
  name: "tapestry-link",
  props: {
    link: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState(["visibleNodes"]),
    ...mapGetters(["getNode"]),
    source() {
      return this.getNode(this.link.source.id)
    },
    target() {
      return this.getNode(this.link.target.id)
    },
    isVisible() {
      return this.source.nodeType !== "" && this.target.nodeType !== ""
    },
  },
}
</script>

<style lang="scss" scoped>
.opaque {
  opacity: 0.2;
}
</style>
