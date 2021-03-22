<template>
  <div ref="wrapper" class="page-nav-wrapper">
    <aside
      ref="container"
      data-qa="page-nav-container"
      :class="[
        'page-nav',
        {
          lightbox: !node.fullscreen,
          closed: burgerView && !opened,
        },
      ]"
      :style="pageNavStyle"
    >
      <button
        v-if="burgerView"
        class="page-nav-toggle"
        data-qa="page-nav-toggle"
        @click="opened = !opened"
      >
        <i v-if="!opened" class="fas fa-bars fa-lg"></i>
        <i v-else class="fas fa-times fa-lg"></i>
      </button>
      <div v-if="opened || !burgerView" class="page-nav-content">
        <page-menu
          v-for="row in rows"
          :key="row.node.id"
          :node="row.node"
          :active="Number(active)"
          :lockRows="lockRows"
          :shouldDisable="disableRow(row.node.id)"
          :isBase="true"
        />
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
    parentRefs: {
      type: Object,
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
      opened: false,
      browserWidth: Helpers.getBrowserWidth(),
    }
  },
  created() {
    window.addEventListener("resize", Helpers.debounce(this.setBrowserWidth, 300))
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
    burgerView() {
      return !this.node.fullscreen || this.browserWidth < 800
    },
    pageNavStyle() {
      return {
        height: this.node.fullscreen ? "100vh" : `${this.dimensions.height}px`,
      }
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
  mounted() {
    if (this.parentRefs.rowRefs) {
      const observer = new IntersectionObserver(this.handleObserve, {
        threshold: [0.5],
      })
      for (const ref of this.parentRefs.rowRefs) {
        observer.observe(ref)
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
      this.$root.$emit("page-nav-bar::view", this.$refs.container)
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", Helpers.debounce(this.setBrowserWidth, 300))
    this.$router.push({
      ...this.$route,
      query: { ...this.$route.query, row: undefined },
    })
  },
  methods: {
    setBrowserWidth() {
      let browserWidth = Helpers.getBrowserWidth()
      this.browserWidth = browserWidth
      this.$nextTick(() => {
        this.$root.$emit("page-nav-bar::view", this.$refs.container)
      })
    },
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
.page-nav-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 11;
  transform: translateX(0);
  transition: all 0.2s ease-in-out;

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

    &.closed {
      min-width: 0px;
    }

    &.lightbox {
      border-radius: 15px 0 0 15px;

      &.closed {
        background: transparent;
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
    }

    .page-nav-title {
      margin-bottom: 1em;
    }

    .page-nav-container {
      text-align: left;
    }
  }
}
</style>
