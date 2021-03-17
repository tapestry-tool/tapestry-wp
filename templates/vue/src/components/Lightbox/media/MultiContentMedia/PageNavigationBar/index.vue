<template>
  <div
    ref="wrapper"
    data-qa="page-nav"
    :class="['page-nav-container', { closed: closed }]"
  >
    <aside
      ref="content"
      data-qa="page-nav-content"
      :class="['page-nav', { closed: closed }]"
    >
      <div class="content-title">
        {{ node.title }}
      </div>
      <page-menu
        v-for="row in rows"
        :key="row.node.id"
        :node="row.node"
        :lockRows="lockRows"
        :shouldDisable="disableRow(row.node.id)"
        @scroll-to="scrollToRef"
      />
    </aside>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import PageMenu from "./PageMenu"

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
    parentRefs: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getNode", "isMultiContent"]),
    active: {
      get() {
        return this.$route.query.row
      },
      set(section) {
        if (section !== this.active) {
          this.$router.push({
            ...this.$route,
            query: { ...this.$route.query, row: section },
          })
        }
      },
    },
    closed() {
      // TODO: Only close if screen dimensions are too small
      return false
      // return this.active === undefined
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
    closed: {
      immediate: true,
      handler(closed) {
        if (!closed) {
          this.scrollToRef(this.active)
        }
      },
    },
    nodeId: {
      immediate: true,
      handler() {
        if (!this.closed) {
          /**
           * If the new node doesn't have a particular section, change to the multi-content node ID
           * section (guaranteed on all nodes).
           */
          this.$nextTick(() => {
            if (!this.$refs[this.active]) {
              this.$router.replace({
                path: this.$route.path,
                query: {
                  ...this.$route.query,
                  row: this.node.id,
                },
              })
            }
          })
        }
      },
    },
    active(newNodeId) {
      this.scrollToRef(newNodeId)
    },
  },
  mounted() {
    // TODO: Get ALL the refs
    if (this.parentRefs.rowRefs) {
      const observer = new IntersectionObserver(this.handleObserve, {
        threshold: [0.5, 0.8],
      })
      for (const ref of this.parentRefs.rowRefs) {
        observer.observe(ref)
      }
    }
  },
  methods: {
    /**
     * This callback is called whenever any section cross 50% and 80% visibility.
     *  - If a section crosses 80% visibility, make that the current active section.
     *  - If a section goes below 50% visibility without another section going above
     *    80%, go to the _next_ section.
     */
    handleObserve(entries) {
      if (this.closed) {
        return
      }
      const inactive = entries.find(entry => !entry.isIntersecting)
      const nextActive = entries.find(entry => entry.intersectionRatio > 0.8)
      if (nextActive) {
        this.active = Number(nextActive.target.id.split("-")[1])
      } else if (inactive) {
        const nodeId = Number(inactive.target.id.split("-")[1])
        if (nodeId == this.active) {
          this.active = this.nextTab()
        }
      }
    },
    nextTab() {
      const nextTabIndex = this.rowOrder.indexOf(this.active)
      if (nextTabIndex >= 0 && nextTabIndex < this.rowOrder.length - 1) {
        return this.rowOrder[nextTabIndex + 1]
      }
      return this.active
    },
    scrollToRef(nodeId) {
      if (nodeId) {
        this.active = nodeId
        this.$nextTick(() => {
          let el = this.parentRefs.rowRefs.find(ref => ref.id === `row-${nodeId}`)
          if (el && el.hasOwnProperty("$el")) {
            el = el.$el
          }
          if (el) {
            el.scrollIntoView({
              behavior: "smooth",
            })
          }
        })
      }
    },
    disableRow(nodeId) {
      const index = this.rows.findIndex(row => row.node.id === nodeId)
      return this.lockRows && this.disabledFrom >= 0 && index > this.disabledFrom
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
  },
}
</script>

<style lang="scss">
.page-nav-container {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 11;
  transform: translateX(0);
  transition: all 0.2s ease-out;

  &.closed {
    transform: translateX(0);
  }

  @media screen and (min-width: 500px) {
    &.closed {
      transform: translateX(100%);
    }
  }

  .page-nav {
    position: relative;
    background: #5d656c;
    color: white;
    height: 100vh;
    padding: 2.2rem 1.5rem;
    transform: translateY(0);
    transition: all 0.2s ease-out;
    width: 100vw;
    font-size: 14px;
    text-align: left;
    z-index: 0;
    overflow-y: auto;

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

    .page-nav-header {
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

    .page-nav-content {
      text-align: left;

      section {
        margin-bottom: 2em;
        &:last-child {
          margin-bottom: 3rem;
        }

        .content-header {
          margin: 1em -1em 0.2em;
          position: relative;
          border-bottom: solid 2px #6b747d;
          padding: 0.2em 1em;
          font-size: 1.75em;
        }

        .content-body {
          display: block;
          text-align: left;
          color: #becddc;

          a {
            color: #becddc;
          }
        }
      }
    }
  }
}
</style>
