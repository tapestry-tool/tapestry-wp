<template>
  <div ref="wrapper" :class="['sidebar-container', { closed: isClosed }]">
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
      <button
        :class="['close-button', { closed: isClosed }]"
        @click.stop="isClosed = true"
      >
        <tapestry-icon icon="chevron-down" />
      </button>
    </div>
    <aside ref="content" :class="['sidebar', { closed: isClosed }]">
      <div class="sidebar-content">
        <header class="sidebar-header">
          <h3 ref="info" data-name="info" class="content-title">{{ node.title }}</h3>
          <div class="button-container">
            <button
              v-if="node.accessible || canEdit"
              class="action-button"
              @click="viewNode"
            >
              <tapestry-icon icon="eye" />
              View
            </button>
            <button v-if="canEdit" class="action-button" @click="$emit('edit')">
              <tapestry-icon icon="pencil-alt" />
              Edit
            </button>
          </div>
        </header>
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
import Helpers from "@/utils/Helpers"

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
    canEdit() {
      return (
        wpApiSettings.wpCanEditTapestry === "1" ||
        Helpers.hasPermission(this.node, "edit")
      )
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
    selectedNodeId() {
      if (!this.isClosed) {
        this.active = "info"
      }
    },
  },
  mounted() {
    const observer = new IntersectionObserver(this.handleObserve, {
      threshold: INTERSECTION_THRESHOLD,
    })
    observer.observe(this.$refs.info)
    this.$root.$on("bv::modal::shown", (_, modalId) => {
      this.updateNodeModalPosition(modalId)
    })
  },
  methods: {
    handleObserve(entries) {
      if (this.isClosed) {
        return
      }

      const entry = entries[0]
      if (entry.intersectionRatio > INTERSECTION_THRESHOLD) {
        this.active = "info"
      } else {
        this.active = "copyright"
      }
    },
    scrollToRef(refName) {
      if (this.isClosed) {
        this.isClosed = false
      }
      this.$nextTick(() => {
        const el = this.$refs[refName]
        this.$refs.content.scroll(0, el.offsetTop - PADDING_OFFSET)
        this.active = refName
      })
    },
    viewNode() {
      this.$router.push(`/nodes/${this.selectedNodeId}`)
    },
    updateNodeModalPosition(modalId) {
      if (!this.isClosed) {
        const { width: sidebarWidth } = this.$refs.wrapper.getBoundingClientRect()
        const browserWidth = Helpers.getBrowserWidth()
        if (browserWidth >= 1280) {
          const modal = document.querySelector(`#${modalId} .modal-dialog`)
          const modalSpace = browserWidth - sidebarWidth
          modal.style.marginLeft = (modalSpace - 800) / 2 + "px"
        }
      }
    },
  },
}
</script>

<style lang="scss">
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

  @media screen and (min-width: 500px) {
    display: grid;
    grid-template-columns: 2.5em 1fr;

    &.closed {
      transform: translateX(calc(100% - 2.5em));
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

  @media screen and (min-width: 500px) {
    width: 100%;
    height: 2em;
  }
}

.action-button {
  padding: 0;
  background: none;
  color: inherit;
  margin-right: 1em;

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    background: none;
    color: var(--teal);
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

  &:hover {
    background: var(--gray);
  }

  @media screen and (min-width: 500px) {
    bottom: auto;
    right: -1.2em;
    top: 50%;
    transform: translateY(-50%) rotate(-90deg);
    align-items: flex-end;

    i {
      margin-bottom: 4px;
    }
  }
}

.sidebar {
  background: white;
  color: inherit;
  height: 100vh;
  padding-bottom: 4em;
  transform: translateY(0);
  transition: all 0.2s ease-out;
  width: 100vw;
  font-size: 14px;
  z-index: 0;
  overflow-y: scroll;

  &.closed {
    cursor: pointer;
    transform: translateY(100%);
  }

  @media screen and (min-width: 500px) {
    min-width: 300px;
    width: 30vw;
    max-width: 400px;
    grid-column: 2;
    padding-bottom: 0;

    &.closed {
      transform: translateY(0);
    }
  }

  @media screen and (min-width: 960px) {
    font-size: calc(14px + (2 * (100vw - 960px) / 1280px - 960px));
  }

  @media screen and (min-width: 1280px) {
    font-size: 16px;
  }
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
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
  height: 4em;
  z-index: 10;

  i {
    display: block;
    text-align: left;
  }

  @media screen and (min-width: 500px) {
    position: relative;
    padding: 32px 0;
    height: 100vh;
    width: 2.5em;
    flex-direction: column;
    justify-content: flex-start;
  }
}

.sidebar-content {
  padding: 3rem 2rem;

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
