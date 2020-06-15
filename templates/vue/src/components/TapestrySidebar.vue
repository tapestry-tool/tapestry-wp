<template>
  <aside :class="['sidebar', { closed: isClosed }]" @click="isClosed = !isClosed">
    <div class="sidebar-preview">
      <button
        :class="['anchor-button', { active: active === 'info' }]"
        @click.stop="scrollToRef('info')"
      >
        <tapestry-icon icon="info-circle" />
      </button>
      <button
        v-if="node.license || node.references"
        :class="['anchor-button', { active: active === 'copyright' }]"
        @click.stop="scrollToRef('copyright')"
      >
        <tapestry-icon icon="copyright" />
      </button>
    </div>
    <div ref="content" class="sidebar-content">
      <h3 ref="info" data-name="info" class="content-title">{{ node.title }}</h3>
      <section>
        <h4 class="content-separator">About</h4>
        <p class="content-description">{{ node.description }}</p>
      </section>
      <section ref="copyright" data-name="copyright">
        <section v-if="node.license">
          <h4 class="content-separator">Copyright</h4>
          <p class="content-description">{{ node.license }}</p>
        </section>
        <section v-if="node.references">
          <h4 class="content-separator">References</h4>
          <p class="content-description">{{ node.references }}</p>
        </section>
      </section>
    </div>
  </aside>
</template>

<script>
import { mapGetters, mapState } from "vuex"
import TapestryIcon from "@/components/TapestryIcon"

const INTERSECTION_THRESHOLD = 0.5
const PADDING_OFFSET = 48

export default {
  components: {
    TapestryIcon,
  },
  data() {
    return {
      isClosed: true,
      active: null,
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
          this.active = null
        } else {
          tapestryContainer.classList.add("sidebar-open")
        }
      },
    },
  },
  mounted() {
    const observer = new IntersectionObserver(this.handleObserve, {
      threshold: INTERSECTION_THRESHOLD,
    })
    observer.observe(this.$refs.info)
    observer.observe(this.$refs.copyright)
  },
  methods: {
    handleObserve(entries) {
      entries.forEach(entry => {
        if (entry.intersectionRatio > INTERSECTION_THRESHOLD) {
          this.active = entry.target.dataset.name
        }
      })
    },
    scrollToRef(refName) {
      const el = this.$refs[refName]
      this.$refs.content.scroll(0, el.offsetTop - PADDING_OFFSET)
    },
  },
}
</script>

<style lang="scss" scoped>
.anchor-button {
  padding: 0;
  background: 0;
  width: 40px;
  height: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4em;

  &:hover {
    background: var(--teal);
  }

  &.active {
    background: var(--teal);
  }
}

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
  padding: 32px 0;

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
