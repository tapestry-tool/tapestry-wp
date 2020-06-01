<template>
  <aside class="sidebar">
    {{ node.title }}
  </aside>
</template>

<script>
import { mapGetters, mapState } from "vuex"

export default {
  data() {
    return {
      isClosed: false,
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
    ...mapState(["selectedNodeId"]),
    node() {
      return this.getNode(this.selectedNodeId)
    },
  },
}
</script>

<style lang="scss" scoped>
.sidebar {
  height: 100vh;
  position: fixed;
  right: 0;
  top: 0;
  padding: 48px 1em 48px 1em;
  background: var(--gray);
}
</style>
