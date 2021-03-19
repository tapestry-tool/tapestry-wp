<template>
  <div
    ref="wrapper"
    data-qa="page-nav"
    :class="['page-nav-wrapper', { closed: burgerView }]"
  >
    <aside
      ref="container"
      data-qa="page-nav-container"
      :class="['page-nav', { closed: burgerView }]"
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
        <div class="page-nav-title">
          {{ node.title }}
        </div>
        <page-menu
          v-for="row in rows"
          :key="row.node.id"
          :node="row.node"
          :active="Number(active)"
          :lockRows="lockRows"
          :shouldDisable="disableRow(row.node.id)"
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
  },
  data() {
    return {
      opened: false,
      width: Helpers.getBrowserWidth(),
    }
  },
  created() {
    window.addEventListener("resize", Helpers.debounce(this.setWidth, 300))
  },
  destroyed() {
    window.removeEventListener("resize", Helpers.debounce(this.setWidth, 300))
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
      return this.width < 800
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
  beforeDestroy() {
    this.$router.push({
      ...this.$route,
      query: { ...this.$route.query, row: undefined },
    })
  },
  methods: {
    setWidth() {
      let width = Helpers.getBrowserWidth()
      this.width = width
    },
    /**
     * This callback is called whenever any section cross 50% and 80% visibility.
     *  - If a section crosses 80% visibility, make that the current active section.
     *  - If a section goes below 50% visibility without another section going above
     *    80%, go to the _next_ section.
     */
    handleObserve(entries) {
      const inactive = entries.find(entry => !entry.isIntersecting)
      const nextActive = entries.find(entry => entry.intersectionRatio > 0.8)
      if (nextActive) {
        const nodeId = Number(nextActive.target.id.split("-")[1])
        this.active = nodeId
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
  top: 24px;
  left: 0;
  z-index: 11;
  transform: translateX(0);
  transition: all 0.2s ease-out;

  .page-nav {
    position: relative;
    background: #5d656c;
    color: white;
    height: 100vh;
    padding: 2.2rem 1.5rem;
    transform: translateY(0);
    transition: all 0.2s ease-out;
    font-size: 14px;
    text-align: left;
    z-index: 0;
    overflow-y: auto;

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
