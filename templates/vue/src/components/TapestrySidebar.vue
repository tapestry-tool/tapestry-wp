<template>
  <div ref="wrapper" :class="['sidebar-container', { closed: closed }]">
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
      <button :class="['toggle-button', { closed: closed }]" @click.stop="toggle">
        <tapestry-icon :icon="closed ? 'chevron-left' : 'chevron-right'" />
      </button>
      <button
        :class="['anchor-button', 'close-button-mobile', { closed: closed }]"
        @click.stop="toggle"
      >
        <tapestry-icon icon="times" />
      </button>
    </div>
    <aside ref="content" :class="['sidebar', { closed: closed }]">
      <header class="sidebar-header">
        <h1 ref="info" data-name="info" class="content-title">{{ node.title }}</h1>
        <div class="button-container">
          <b-button v-if="node.accessible || canEdit" @click="viewNode">
            <tapestry-icon icon="eye" />
            View
          </b-button>
          <b-button v-if="canEdit" @click="$root.$emit('edit-node', nodeId)">
            <tapestry-icon icon="pencil-alt" />
            Edit
          </b-button>
        </div>
      </header>
      <div class="sidebar-content">
        <section v-if="node.description">
          <h2 class="content-header">About</h2>
          <div class="content-body" v-html="node.description"></div>
        </section>
        <section ref="copyright" data-name="copyright">
          <section v-if="node.license">
            <h2 class="content-header">License</h2>
            <p class="content-body" style="margin-bottom: 0.5em;">
              <a
                v-if="license.type === licenseTypes.CUSTOM && license.link"
                :href="license.link"
                target="_blank"
              >
                <span style="margin-right: 4px;" class="license-link">
                  {{ license.name }}
                </span>
                <tapestry-icon icon="external-link-alt" />
              </a>
              <span v-else class="license-link">
                <span v-if="node.license.type !== licenseTypes.CUSTOM">
                  <i v-for="icon in license.icons" :key="icon" :class="icon"></i>
                </span>
                {{ license.name }}
              </span>
            </p>
            <div
              v-if="license.type === licenseTypes.CUSTOM && license.description"
              class="content-body"
              v-html="license.description"
            ></div>
          </section>
          <section v-if="node.references">
            <h2 class="content-header">References</h2>
            <div class="content-body" v-html="node.references"></div>
          </section>
        </section>
      </div>
    </aside>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TapestryIcon from "@/components/TapestryIcon"
import { names } from "@/config/routes"
import Helpers from "@/utils/Helpers"
import { licenseTypes, licenses } from "@/utils/constants"

const INTERSECTION_THRESHOLD = 0.5
const PADDING_OFFSET = 48

export default {
  components: {
    TapestryIcon,
  },
  data() {
    return {
      active: null,
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
    closed: {
      get() {
        return !this.$route.query.sidebar
      },
      set(closed) {
        // eslint-disable-next-line no-unused-vars
        const { sidebar: _, ...rest } = this.$route.query
        const newQuery = closed ? rest : { ...this.$route.query, sidebar: true }
        this.$router.push({ ...this.$route, query: newQuery })
      },
    },
    nodeId() {
      return parseInt(this.$route.params.nodeId, 10)
    },
    node() {
      return this.getNode(this.nodeId)
    },
    canEdit() {
      return Helpers.hasPermission(this.node, "edit")
    },
    licenseTypes() {
      return licenseTypes
    },
    license() {
      return {
        ...this.node.license,
        ...licenses[this.node.license.type],
      }
    },
  },
  watch: {
    closed(closed) {
      if (closed) {
        this.active = null
      }
    },
    nodeId() {
      if (!this.closed) {
        this.active = "info"
      }
    },
  },
  mounted() {
    const observer = new IntersectionObserver(this.handleObserve, {
      threshold: INTERSECTION_THRESHOLD,
    })
    observer.observe(this.$refs.info)
  },
  methods: {
    handleObserve(entries) {
      if (this.closed) {
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
      if (this.closed) {
        this.toggle()
      }
      this.$nextTick(() => {
        const el = this.$refs[refName]
        this.$refs.content.scroll(0, el.offsetTop - PADDING_OFFSET)
        this.active = refName
      })
    },
    viewNode() {
      this.$router.push({
        name: names.LIGHTBOX,
        params: { nodeId: this.nodeId },
        query: this.$route.query,
      })
    },
    toggle() {
      this.closed = !this.closed
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
  pointer-events: all;

  &.closed {
    transform: translateX(0);
    pointer-events: none;
  }

  @media screen and (min-width: 500px) {
    display: grid;
    grid-template-columns: 2.5em 1fr;

    &.closed {
      transform: translateX(calc(100% - 2.5em));
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
    height: 4em;
    z-index: 10;
    pointer-events: all;

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

    .anchor-button {
      padding: 0;
      background: 0;
      height: 100%;
      width: 2.5em;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8em;
      opacity: 0.6;

      &:hover,
      &.active {
        background: none;
        opacity: 1;
      }

      @media screen and (min-width: 500px) {
        width: 100%;
        height: 2em;
      }
    }

    .toggle-button {
      display: none;

      @media screen and (min-width: 500px) {
        padding: 0;
        background: var(--gray);
        position: absolute;
        width: 2.5em;
        height: 2.5em;
        bottom: auto;
        right: 1em;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;

        &:hover {
          background: var(--gray);
        }

        i {
          margin-bottom: 0;
        }
      }
    }

    .close-button-mobile {
      position: absolute;
      right: 0;
      bottom: 0;

      &.closed {
        display: none;
      }

      @media screen and (min-width: 500px) {
        display: none;
      }
    }
  }

  .sidebar {
    background: #5d656c;
    color: white;
    height: 100vh;
    padding: 2.2rem 1rem;
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
      width: 25vw;
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

    .sidebar-header {
      margin-bottom: 1.5em;
      text-align: left;

      .content-title {
        margin-bottom: 0.2em;
      }

      .button-container {
        button {
          font-size: 1em;
          i {
            margin-right: 4px;
          }
        }
      }
    }

    .sidebar-content {
      section {
        margin-bottom: 2em;
        &:last-child {
          margin-bottom: 3rem;
        }

        .content-header {
          margin: 1em 0 0.2em;
          position: relative;
          text-align: left;
          border-bottom: solid 2px #6b747d;
          padding: 0.2em 0;
        }

        .content-body {
          display: block;
          text-align: left;
          color: #becddc;

          a {
            color: #becddc;
          }

          .license-link {
            color: white;
            text-transform: capitalize;
            font-weight: 600;
            i {
              margin-right: 4px;
            }
          }
        }
      }
    }
  }
}
</style>
