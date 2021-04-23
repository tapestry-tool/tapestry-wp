<template>
  <div ref="wrapper" class="page-nav-wrapper">
    <aside
      ref="container"
      data-qa="page-nav-container"
      :class="[
        'page-nav',
        {
          lightbox: !node.fullscreen,
          fullscreen: node.fullscreen,
          closed: !opened,
        },
      ]"
      :style="{ height: node.fullscreen ? '100vh' : dimensions.height + 'px' }"
    >
      <button
        :class="[
          'page-nav-toggle',
          {
            fullscreen: node.fullscreen,
          },
        ]"
        data-qa="page-nav-toggle"
        @click="opened = !opened"
      >
        <i v-if="!opened" class="fas fa-bars fa-lg"></i>
        <i v-else class="fas fa-times fa-lg"></i>
      </button>
      <div
        :class="[
          'page-nav-content',
          {
            fullscreen: node.fullscreen,
            closed: !opened,
          },
        ]"
      >
        <ul class="page-menu fa-ul">
          <page-menu
            v-for="row in rows"
            :key="row.node.id"
            :node="row.node"
            :active="Number(active)"
            :lockRows="lockRows"
            :disabled="disableRow(row.node)"
            @scroll-to="scrollToRef"
          />
        </ul>
      </div>
    </aside>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import PageMenu from "./PageMenu"
import Helpers from "@/utils/Helpers"

export default {
  name: "page-navigation-bar",
  components: {
    PageMenu,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    rowRefs: {
      type: Array,
      required: true,
    },
    dimensions: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      opened: false || this.browserWidth > 800,
      browserWidth: Helpers.getBrowserWidth(),
      observer: null,
    }
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getNode", "isMultiContent"]),
    active: {
      get() {
        return this.$route.query.row
      },
      set(nodeId) {
        if (nodeId !== this.active) {
          this.$router.push({
            ...this.$route,
            query: { ...this.$route.query, row: nodeId },
          })
        }
      },
    },
    nodeId() {
      return parseInt(this.$route.params.nodeId, 10)
    },
    rows() {
      return this.node.childOrdering.map(id => {
        const node = this.getNode(id)
        const children = this.isMultiContent(node.id)
          ? node.childOrdering.map(this.getNode)
          : this.getDirectChildren(id).map(this.getNode)
        return { node, children }
      })
    },
    lockRows() {
      return this.node.typeData.lockRows
    },
    disabledFrom() {
      return this.rows.findIndex(row => !row.node.completed)
    },
    rowOrder() {
      return this.getRowOrder(this.node)
    },
  },
  watch: {
    rowRefs: {
      immediate: true,
      handler(refs) {
        for (const ref of refs) {
          this.observer.observe(ref)
        }
      },
    },
  },
  mounted() {
    this.observer = new IntersectionObserver(this.handleObserve, {
      threshold: [0.5],
    })
    if (this.rowRefs) {
      for (const ref of this.rowRefs) {
        this.observer.observe(ref)
      }
      this.$router.push({
        ...this.$route,
        query: {
          ...this.$route.query,
          row:
            this.node.childOrdering.length > 0
              ? this.node.childOrdering[0]
              : undefined,
        },
      })
    }
  },
  methods: {
    /**
     * This callback is called whenever any section cross 50% visibility.
     *  - If a page enters from above, set it to the active page.
     *  - If a page leaves from above, set the next page to the active page.
     */
    handleObserve(entries) {
      for (const entry of entries) {
        // Page visibility from above
        if (entry.boundingClientRect.top <= 0) {
          if (entry.isIntersecting) {
            // Page entering
            const nodeId = Number(entry.target.id.split("-")[1])
            this.active = nodeId
          } else {
            // Page leaving
            this.active = this.nextPage()
          }
        }
      }
    },
    nextPage() {
      const nextTabIndex = this.rowOrder.indexOf(this.active)
      if (nextTabIndex >= 0 && nextTabIndex < this.rowOrder.length - 1) {
        return this.rowOrder[nextTabIndex + 1]
      }
      return this.active
    },
    disableRow(node) {
      const index = this.rows.findIndex(row => row.node.id === node.id)
      return (
        (this.lockRows && this.disabledFrom >= 0 && index > this.disabledFrom) ||
        !node.unlocked
      )
    },
    getRowOrder(node, nodes = [], visited = new Set()) {
      nodes.push(node.id)
      visited.add(node.id)
      const rows = this.isMultiContent(node.id)
        ? node.childOrdering.map(this.getNode)
        : this.getDirectChildren(node.id).map(this.getNode)
      for (const row of rows) {
        if (!visited.has(row.id)) {
          this.getRowOrder(row, nodes, visited)
        }
      }
      return nodes
    },
    scrollToRef(nodeId) {
      this.$nextTick(() => {
        if (this.rowRefs) {
          let el = this.rowRefs.find(ref => ref.id === `row-${nodeId}`)
          if (el && el.hasOwnProperty("$el")) {
            el = el.$el
          }
          if (el) {
            el.scrollIntoView({
              behavior: "smooth",
            })
          }
        }
      })
    },
  },
}
</script>

<style lang="scss">
.page-nav-wrapper {
  .page-nav {
    position: relative;
    color: white;
    background: #5d656c;
    padding: 2.2rem 1.5rem;
    transform: translateY(0);
    transition: all 0.2s ease-in-out;
    font-size: 14px;
    text-align: left;
    z-index: 0;
    overflow-y: auto;
    min-width: 200px;

    &.lightbox {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 11;
      border-radius: 15px 0 0 15px;

      &.closed {
        background: transparent;
        min-width: 20px;
        max-width: 20px;
      }
    }

    &.fullscreen {
      height: "100vh";
      margin: -24px 24px 0 -24px;
      z-index: 11;

      &.closed {
        @media screen and (max-width: 800px) {
          min-width: calc(16.33px + 3rem);
          width: calc(16.33px + 3rem);
        }
      }
    }

    @media screen and (min-width: 960px) {
      font-size: calc(14px + (2 * (100vw - 960px) / 1280px - 960px));
    }

    @media screen and (min-width: 1280px) {
      font-size: 16px;
    }

    .page-nav-toggle {
      background-color: transparent;
      padding: 0;
      margin-bottom: 1em;

      &.fullscreen {
        @media screen and (min-width: 801px) {
          display: none;
        }
      }
    }

    .page-nav-title {
      margin-bottom: 1em;
    }

    .page-nav-container {
      text-align: left;
    }

    .page-nav-content {
      &.fullscreen {
        &.closed {
          @media screen and (max-width: 800px) {
            display: none;
          }

          @media screen and (min-width: 801px) {
            display: block;
          }
        }
      }

      &.closed {
        display: none;
      }
    }
  }
}
</style>
