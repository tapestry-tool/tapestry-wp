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
      const id = this.link.source.id || this.link.source
      return this.getNode(id)
    },
    target() {
      const id = this.link.target.id || this.link.target
      return this.getNode(id)
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
