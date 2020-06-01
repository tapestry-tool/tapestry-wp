<template>
  <aside :class="['sidebar', { closed: isClosed }]" @click="isClosed = !isClosed">
    <p>{{ node.title }}</p>
  </aside>
</template>

<script>
import { mapGetters, mapState } from "vuex"

export default {
  data() {
    return {
      isClosed: true,
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
    ...mapState(["selectedNodeId"]),
    node() {
      return this.getNode(this.selectedNodeId)
    },
  },
  watch: {
    isClosed: {
      immediate: true,
      handler(isClosed) {
        const tapestryContainer = document.getElementById("tapestry")
        if (isClosed) {
          tapestryContainer.classList.remove("sidebar-open")
        } else {
          tapestryContainer.classList.add("sidebar-open")
        }
      },
    },
  },
}
</script>

<style lang="scss" scoped>
.sidebar {
  background: var(--gray);
  color: white;
  height: 100vh;
  min-width: 300px;
  padding: 3rem 0;
  position: fixed;
  right: 0;
  top: 0;
  transform: translateX(0);
  transition: all 0.2s ease-out;
  width: 30vw;

  &.closed {
    cursor: pointer;
    transform: translateX(90%);
  }
}
</style>
