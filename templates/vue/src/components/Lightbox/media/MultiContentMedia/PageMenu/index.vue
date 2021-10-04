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
          'is-unit-child': pages && contentVisible,
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
        <i v-if="!opened" class="fas fa-bars fa-lg" style="color: black;"></i>
        <i v-else class="fas fa-times fa-lg"></i>
      </button>
      <div v-if="pages && contentVisible">
        <b-dropdown
          v-if="pages && contentVisible"
          class="unit-switch-dropdown"
          block
          split
        >
          <b-dropdown-item
            v-for="page in pages"
            :key="page.id"
            @click="changePage(page.id)"
          >
            {{ page.title }}
          </b-dropdown-item>
        </b-dropdown>
        <h5 class="pl-2 py-1 mb-4"></h5>
      </div>
      <div
        :class="[
          'page-nav-content',
          {
            fullscreen: node.fullscreen,
            closed: !opened,
          },
        ]"
      >
        <ul class="page-menu-items fa-ul">
          <page-menu-item
            v-for="row in rows"
            :key="row.node.id"
            :node="row.node"
            :lockRows="lockRows"
            :disabled="disabledRow(row.node)"
            @scroll-to="scrollToRef"
          />
        </ul>
      </div>
    </aside>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import PageMenuItem from "./PageMenuItem"
import Helpers from "@/utils/Helpers"

export default {
  name: "page-menu",
  components: {
    PageMenuItem,
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
      opened: false,
      selectedPage: this.node.id,
    }
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getNode", "isMultiContent", "getParent"]),
    nodeId() {
      return parseInt(this.$route.params.nodeId, 10)
    },
    parentNode() {
      const parentNodeId = this.getParent(this.node.id)
      return this.getNode(parentNodeId)
    },
    rows() {
      return this.node.childOrdering
        .map(id => {
          const node = this.getNode(id)
          let children = this.isMultiContent(node.id)
            ? node.childOrdering.map(this.getNode)
            : this.getDirectChildren(id).map(this.getNode)
          children = children.filter(node => !node.popup)
          return { node, children }
        })
        .filter(row => !row.node.popup)
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
    pages() {
      if (
        this.parentNode?.mediaType === "multi-content" &&
        this.parentNode?.presentationStyle === "unit"
      ) {
        return this.parentNode.childOrdering.reduce((pages, nodeId) => {
          const node = this.getNode(nodeId)
          pages[nodeId] = {
            id: node.id,
            title: node.title,
          }
          return pages
        }, {})
      }
      return {}
    },
    browserWidth() {
      return Helpers.getBrowserWidth()
    },
    contentVisible() {
      return this.opened || this.browserWidth > 800
    },
  },
  mounted() {
    if (this.rowRefs) {
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
    disabledRow(node) {
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
    changePage(pageNodeId) {
      this.selectedPage = pageNodeId
      this.$root.$emit("open-node", pageNodeId)
    },
    scrollToRef(nodeId) {
      this.$nextTick(() => {
        if (this.rowRefs) {
          let el = this.rowRefs.find(ref => ref && ref.id === `row-${nodeId}`)
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

<style lang="scss" scoped>
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

    &.is-unit-child {
      width: 250px;
      max-width: 25vw;
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

      .page-menu-items {
        margin-left: 2em;
        margin-right: -0.5em;
      }
    }
  }
}
</style>

<style lang="scss">
.unit-switch-dropdown {
  margin: 1.2rem -24px !important;
  button {
    border-radius: 0;
    background: #fff2;
    border-color: #fff1;
    &:hover {
      background: transparent;
      border-color: transparent;
    }
    &:first-child {
      text-align: left;
      padding-left: 30px;
      font-size: 1.6em;
      font-weight: bold;
    }
  }
  .dropdown-menu {
    width: calc(100% - 10px);
    margin-top: 5px;

    &::after {
      content: "";
      position: absolute;
      width: 0;
      height: 0;
      border: solid 7px #fff;
      border-bottom-width: 8px;
      border-left-color: transparent;
      border-right-color: transparent;
      border-top-color: transparent;
      top: -15px;
      right: 2px;
    }

    > li {
      line-height: 1.75em !important;
      a {
        white-space: normal !important;
      }
    }
  }
}
</style>
