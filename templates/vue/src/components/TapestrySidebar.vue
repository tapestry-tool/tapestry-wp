<template>
  <aside :class="['sidebar', { closed: isClosed }]" @click="isClosed = !isClosed">
    <div class="sidebar-preview">
      <button @click.stop="scrollToRef('info')">
        <tapestry-icon icon="angle-double-left" />
      </button>
      <button @click.stop="scrollToRef('license')">
        <tapestry-icon icon="angle-double-left" />
      </button>
      <button @click.stop="scrollToRef('references')">
        <tapestry-icon icon="angle-double-left" />
      </button>
    </div>
    <div ref="content" class="sidebar-content">
      <h3 ref="info" class="content-title">{{ node.title }}</h3>
      <section>
        <h4 class="content-separator">About</h4>
        <p class="content-description">{{ node.description }}</p>
      </section>
      <section v-if="node.license" ref="license">
        <h4 class="content-separator">Copyright</h4>
        <p class="content-description">{{ node.license }}</p>
      </section>
      <section v-if="node.references" ref="references">
        <h4 class="content-separator">References</h4>
        <p class="content-description">{{ node.references }}</p>
      </section>
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
  methods: {
    scrollToRef(refName) {
      const el = this.$refs[refName]
      this.$refs.content.scroll(0, el.offsetTop - 48)
    },
  },
}
</script>

<style lang="scss" scoped>
.sidebar {
  background: white;
  color: inherit;
  display: grid;
  grid-template-columns: 2.5em 1fr;
  height: 100vh;
  min-width: 300px;
  position: fixed;
  right: 0;
  top: 0;
  transform: translateX(0);
  transition: all 0.2s ease-out;
  width: 30vw;
  max-width: 400px;

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
  padding: 3rem 2rem;
  overflow: scroll;

  section {
    margin-bottom: 1em;
    &:last-child {
      margin-bottom: 3rem;
    }
  }

  .content-title {
    text-align: left;
    margin-bottom: 1em;
  }

  .content-separator {
    margin-bottom: 1.5em;
    position: relative;
    text-align: left;

    &:after {
      content: "";
      position: absolute;
      width: 50%;
      height: 3px;
      background: black;
      left: 0;
      bottom: -12px;
    }
  }

  .content-description {
    display: block;
    text-align: left;
  }
}
</style>
