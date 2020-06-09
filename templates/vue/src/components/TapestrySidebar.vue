<template>
  <aside :class="['sidebar', { closed: isClosed }]" @click="isClosed = !isClosed">
    <div class="sidebar-preview">
      <tapestry-icon icon="angle-double-left" />
    </div>
    <div class="sidebar-content">
      <h3 class="content-title">{{ node.title }}</h3>
      <h4 class="content-separator">About</h4>
      <p class="content-description">{{ node.description }}</p>
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
  background: white;
  color: inherit;
  display: grid;
  grid-template-columns: 40px 1fr;
  height: 100vh;
  min-width: 300px;
  position: fixed;
  right: 0;
  top: 0;
  transform: translateX(0);
  transition: all 0.2s ease-out;
  width: 30vw;

  &.closed {
    cursor: pointer;
    transform: translateX(calc(100% - 40px));
  }
}

.sidebar-preview {
  background: var(--gray);

  i {
    display: block;
    text-align: left;
  }

  .preview-title {
    display: block;
    margin-top: 1em;
    transform: translateX(8px) rotate(90deg);
    transform-origin: left center;
  }
}

.sidebar-content {
  grid-column: 2;

  .content-title {
    text-align: left;
    margin-bottom: 1em;
  }

  .content-separator {
    margin-bottom: 1em;
    position: relative;
    text-align: left;

    &:after {
      content: "";
      position: absolute;
      width: 50%;
      height: 3px;
      background: white;
      left: 0;
      bottom: -8px;
    }
  }

  .content-description {
    display: block;
    text-align: left;
  }
}
</style>
