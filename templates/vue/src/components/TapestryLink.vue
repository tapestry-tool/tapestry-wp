<template>
  <line
    v-show="isVisible"
    :class="{
      opaque: !visibleNodes.includes(source.id) || !visibleNodes.includes(target.id),
    }"
    :x1="source.coordinates.x"
    :x2="target.coordinates.x"
    :y1="source.coordinates.y"
    :y2="target.coordinates.y"
    @click="remove"
  ></line>
</template>

<script>
import { mapActions, mapState, mapGetters } from "vuex"

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
    ...mapState(["visibleNodes"]),
    ...mapGetters(["getNode"]),
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
