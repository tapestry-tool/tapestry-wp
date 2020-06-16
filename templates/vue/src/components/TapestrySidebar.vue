<template>
  <div :class="['sidebar-container', { closed: isClosed }]">
    <div class="sidebar-preview" @click="isClosed = false">
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
      <button
        :class="['close-button', { closed: isClosed }]"
        @click.stop="isClosed = true"
      >
        <tapestry-icon icon="chevron-down" />
      </button>
    </div>
    <aside :class="['sidebar', { closed: isClosed }]">
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
  </div>
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
      if (this.isClosed) {
        this.isClosed = false
      }
      this.$nextTick(() => {
        const el = this.$refs[refName]
        this.$refs.content.scroll(0, el.offsetTop - PADDING_OFFSET)
      })
    },
  },
}
</script>

<style lang="scss" scoped>
$sm-breakpoint: 500px;
$md-breakpoint: 960px;
$lg-breakpoint: 1280px;
$button-width: 4em;

.sidebar-container {
  position: fixed;
  right: 0;
  top: 0;
  z-index: 0;
  transform: translateX(0);
  transition: all 0.2s ease-out;

  &.closed {
    transform: translateX(0);
  }

  @media screen and (min-width: $sm-breakpoint) {
    display: grid;
    grid-template-columns: $button-width 1fr;

    &.closed {
      transform: translateX(calc(100% - 4em));
    }
  }
}

.anchor-button {
  padding: 0;
  background: 0;
  height: 100%;
  width: 2.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;

  &:hover {
    background: var(--teal);
  }

  &.active {
    background: var(--teal);
  }
}

.close-button {
  padding: 0;
  background: var(--gray);
  position: absolute;
  right: 1em;
  bottom: 5em;
  width: 2.5em;
  height: 2.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &.closed {
    display: none;
  }
}

.sidebar {
  background: white;
  color: inherit;
  height: 100vh;
  padding-bottom: $button-width;
  transform: translateY(0);
  transition: all 0.2s ease-out;
  width: 100vw;
  font-size: 14px;
  z-index: 0;

  &.closed {
    cursor: pointer;
    transform: translateY(100%);
  }

  @media screen and (min-width: $sm-breakpoint) {
    min-width: 300px;
    width: 30vw;
    max-width: 400px;
    grid-column: 2;

    &.closed {
      transform: translateY(0);
    }
  }

  @media screen and (min-width: $md-breakpoint) {
    font-size: calc(
      14px + (2 * (100vw - $md-breakpoint) / $lg-breakpoint - $md-breakpoint)
    );
  }

  @media screen and (min-width: $lg-breakpoint) {
    font-size: 16px;
  }
}

.sidebar-preview {
  background: var(--gray);
  display: flex;
  justify-content: center;
  padding: 0;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: $button-width;
  z-index: 10;

  i {
    display: block;
    text-align: left;
  }

  @media screen and (min-width: $sm-breakpoint) {
    position: relative;
    padding: 32px 0;
    height: 100vh;
    width: 4em;
  }
}

.sidebar-content {
  padding: 3rem 2rem;
  overflow-y: scroll;

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
