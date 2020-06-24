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
    @click="remove"
  ></line>
</template>

<script>
import { mapActions, mapState, mapGetters } from "vuex"

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
    confirmMessage() {
      return `Are you sure you want to delete the link between ${this.source.title} and ${this.target.title}?`
    },
  },
  methods: {
    ...mapActions(["deleteLink"]),
    remove() {
      const shouldDelete = confirm(this.confirmMessage)
      if (shouldDelete) {
        this.deleteLink([this.source.id, this.target.id])
      }
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
    stroke: red;
    stroke-width: 11;
  }
}

.opaque {
  opacity: 0.2;
}
</style>
