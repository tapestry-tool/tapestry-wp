<template>
  <aside :class="['sidebar', { closed: isClosed }]" @click="isClosed = !isClosed">
    <div v-show="isClosed" class="sidebar-preview">
      <tapestry-icon icon="angle-double-left" />
      <p class="title">{{ node.title }}</p>
    </div>
    <div class="sidebar-content">
      <h3>{{ node.title }}</h3>
      <p>{{ node.description }}</p>
    </div>
  </aside>
</template>

<script>
import { mapGetters, mapState } from "vuex"
import TapestryIcon from "@/components/TapestryIcon"

export default {
  components: {
    TapestryIcon,
  },
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
  display: grid;
  grid-template-columns: 10% 80% 10%;
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

.sidebar-preview {
  height: 100vh;
  padding: 48px 0;
  padding-left: 1em;
  position: absolute;

  i {
    display: block;
    text-align: left;
  }

  .title {
    display: block;
    margin: 0;
    transform: translateX(8px) rotate(90deg);
    transform-origin: left center;
  }
}

.sidebar-content {
  grid-column: 2;
}
</style>
