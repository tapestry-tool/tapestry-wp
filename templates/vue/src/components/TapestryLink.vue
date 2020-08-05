<template>
  <transition name="fade">
    <line
      v-show="isVisible"
      :class="{
        opaque:
          !visibleNodes.includes(source.id) || !visibleNodes.includes(target.id),
      }"
      :x1="source.coordinates.x"
      :x2="target.coordinates.x"
      :y1="source.coordinates.y"
      :y2="target.coordinates.y"
      @click="remove"
    ></line>
  </transition>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex"

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
    ...mapState(["visibleNodes", "selectedNodeId"]),
    ...mapGetters(["hasPath"]),
    isVisible() {
      return this.source.nodeType !== "" && this.target.nodeType !== ""
    },
  },
  methods: {
    ...mapActions(["deleteLink"]),
    canDelete() {
      return (
        this.hasPath(this.selectedNodeId, this.source.id) &&
        this.hasPath(this.selectedNodeId, this.target.id)
      )
    },
    remove() {
      const userConfirmDelete = confirm(
        `Are you sure you want to delete the link between ${this.source.title} and ${this.target.title}?`
      )
      if (userConfirmDelete) {
        this.canDelete()
          ? this.deleteLink([this.source.id, this.target.id])
          : alert("You cannot delete this link")
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
