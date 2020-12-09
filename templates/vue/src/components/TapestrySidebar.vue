<template>
  <div
    ref="wrapper"
    data-qa="sidebar"
    :class="['sidebar-container', { closed: closed }]"
  >
    <div class="sidebar-preview">
      <button
        :class="['anchor-button', { active: active === 'info' }]"
        aria-label="information"
        @click.stop="scrollToRef('info')"
      >
        <tapestry-icon icon="info-circle" />
      </button>
      <button
        v-if="node.license || node.references"
        :class="['anchor-button', { active: active === 'copyright' }]"
        aria-label="copyright"
        @click.stop="scrollToRef('copyright')"
      >
        <tapestry-icon icon="copyright" />
      </button>
      <button
        v-if="isReviewParticipant"
        :class="['anchor-button', { active: active === 'review' }]"
        aria-label="review"
        @click.stop="scrollToRef('review')"
      >
        <tapestry-icon icon="comment-dots" />
      </button>
      <button
        :aria-label="closed ? 'open sidebar' : 'close sidebar'"
        :class="['toggle-button', { closed: closed }]"
        @click.stop="active = closed ? 'info' : undefined"
      >
        <tapestry-icon :icon="closed ? 'chevron-left' : 'chevron-right'" />
      </button>
      <button
        :class="['anchor-button', 'close-button-mobile', { closed: closed }]"
        @click.stop="active = undefined"
      >
        <tapestry-icon icon="times" />
      </button>
    </div>
    <aside
      ref="content"
      data-qa="sidebar-content"
      :class="['sidebar', { closed: closed }]"
    >
      <header ref="info" class="sidebar-header" data-name="info">
        <h1 class="content-title">{{ node.title }}</h1>
        <div class="button-container">
          <b-button v-if="node.accessible || canEdit" @click="viewNode">
            <tapestry-icon icon="eye" />
            View
          </b-button>
          <b-button v-if="canEdit" @click="editNode">
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
            <h2 class="content-header">
              License
            </h2>
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
        <section v-if="isReviewParticipant" ref="review" data-name="review">
          <h2 class="content-header">Review</h2>
          <node-review :node="node"></node-review>
        </section>
      </div>
    </aside>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TapestryIcon from "@/components/TapestryIcon"
import NodeReview from "@/components/NodeReview"
import { names } from "@/config/routes"
import Helpers from "@/utils/Helpers"
import { licenseTypes, licenses } from "@/utils/constants"
import * as wp from "@/services/wp"

const PADDING_OFFSET = 48

const tabOrder = ["info", "copyright", "review"]

export default {
  components: {
    NodeReview,
    TapestryIcon,
  },
  computed: {
    ...mapGetters(["getNode"]),
    active: {
      get() {
        return this.$route.query.sidebar
      },
      set(section) {
        if (section !== this.active) {
          this.$router.push({
            ...this.$route,
            query: { ...this.$route.query, sidebar: section },
          })
        }
      },
    },
    closed() {
      return this.active === undefined
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
    isReviewParticipant() {
      return (
        this.node.reviewStatus &&
        (wp.canEditTapestry() || wp.isCurrentUser(this.node.author.id))
      )
    },
  },
  watch: {
    closed: {
      immediate: true,
      handler(closed) {
        if (!closed) {
          this.scrollToRef(this.active)
        }
      },
    },
  },
  mounted() {
    const observer = new IntersectionObserver(this.handleObserve, {
      threshold: [0.4, 0.8],
    })
    const sections = Helpers.omit(this.$refs, ["content", "wrapper"])
    for (const ref in sections) {
      observer.observe(this.$refs[ref])
    }
  },
  methods: {
    /**
     * This callback is called whenever any section cross 20% and 80% visibility.
     *  - If a section crosses 80% visibility, make that the current active section.
     *  - If a section goes below 40% visibility without another section going above
     *    80%, go to the _next_ section.
     */
    handleObserve(entries) {
      if (this.closed) {
        return
      }
      const inactive = entries.find(entry => !entry.isIntersecting)
      const nextActive = entries.find(entry => entry.intersectionRatio > 0.8)
      if (nextActive) {
        this.active = nextActive.target.dataset.name
      } else if (inactive) {
        const { name } = inactive.target.dataset
        if (name === this.active) {
          this.active = this.nextTab()
        }
      }
    },
    nextTab() {
      const nextTabIndex = tabOrder.indexOf(this.active)
      if (nextTabIndex >= 0 && nextTabIndex < tabOrder.length - 1) {
        return tabOrder[nextTabIndex + 1]
      }
      return this.active
    },
    scrollToRef(refName) {
      if (refName) {
        this.active = refName
        this.$nextTick(() => {
          let el = this.$refs[refName]
          if (el.hasOwnProperty("$el")) {
            el = el.$el
          }
          this.$refs.content.scroll(0, el.offsetTop - PADDING_OFFSET)
        })
      }
    },
    viewNode() {
      this.$router.push({
        name: names.LIGHTBOX,
        params: { nodeId: this.nodeId },
        query: this.$route.query,
      })
    },
    editNode() {
      this.$router.push({
        name: names.MODAL,
        params: { nodeId: this.node.id, type: "edit", tab: "content" },
        query: this.$route.query,
      })
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
    position: relative;
    background: #5d656c;
    color: white;
    height: 100vh;
    padding: 2.2rem 1.5rem;
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
      text-align: left;

      section {
        margin-bottom: 2em;
        &:last-child {
          margin-bottom: 3rem;
        }

        .content-header {
          margin: 1em 0 0.2em;
          position: relative;
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
