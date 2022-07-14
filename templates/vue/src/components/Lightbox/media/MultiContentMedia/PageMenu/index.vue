<template>
  <div>
    <transition
      name="slide-fade"
      :css="animate"
      @after-enter="animate = false"
      @enter-cancelled="animate = false"
      @after-leave="animate = false"
      @leave-cancelled="animate = false"
    >
      <aside
        v-show="menuVisible"
        ref="wrapper"
        :class="[
          'page-nav-wrapper',
          {
            lightbox: !node.fullscreen,
            fullscreen: node.fullscreen,
            'unit-child': unitsMenuVisible,
          },
        ]"
      >
        <div
          ref="container"
          data-qa="page-nav-container"
          class="page-nav"
          :style="{ height: node.fullscreen ? '100vh' : dimensions.height + 'px' }"
        >
          <div v-if="unitsMenuVisible">
            <b-dropdown
              class="unit-switch-dropdown"
              block
              split
              :text="parentNodeTitle"
            >
              <b-dropdown-item
                v-for="(page, pageIndex) in pages"
                :key="page.id"
                :active="activePageIndex === pageIndex"
                :disabled="!page.accessible"
                @click="changePage(page.id)"
              >
                <div v-if="!page.accessible" class="disabled-item">
                  <div>{{ page.title }}</div>
                  <i class="fas fa-lock" />
                </div>
                <template v-else>
                  {{ page.title }}
                </template>
              </b-dropdown-item>
            </b-dropdown>
            <h5 class="pl-2 py-1 mb-4">{{ node.title }}</h5>
          </div>
          <div v-if="pageMenuVisible" class="page-nav-content mb-auto">
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
          <a
            v-if="isLoggedIn"
            :href="logoutUrl"
            class="logout-link mt-auto ml-3 pt-4"
          >
            Logout
          </a>
        </div>
      </aside>
    </transition>
    <button
      :class="[
        'page-nav-toggle',
        {
          fullscreen: node.fullscreen,
        },
      ]"
      data-qa="page-nav-toggle"
      @click="toggleMenu"
    >
      <i
        v-if="!opened"
        class="fas fa-bars fa-lg"
        style="color: var(--text-color-primary);"
      ></i>
      <i v-else class="fas fa-times fa-lg"></i>
    </button>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import PageMenuItem from "./PageMenuItem"
import { isLoggedIn, data as wpData } from "@/services/wp"
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
    dimensions: {
      type: Object,
      required: false,
      default: null,
    },
    pages: {
      type: [Array, Boolean],
      required: true,
    },
    activePageIndex: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      opened: false,
      browserWidth: Helpers.getBrowserWidth(),
      animate: false,
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
    parentNodeTitle() {
      return this.parentNode?.title ? this.parentNode.title : ""
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
    isFullScreen() {
      return this.fullScreen || this.node.fullscreen
    },
    menuVisible() {
      return this.opened || (this.node.fullscreen && this.browserWidth > 800)
    },
    unitsMenuVisible() {
      return this.pages && this.parentNode.childOrdering.length > 1
    },
    pageMenuVisible() {
      return this.node.accessible && this.node.typeData.showNavBar
    },
    isLoggedIn() {
      return isLoggedIn()
    },
    logoutUrl() {
      return wpData.logoutUrl
    },
  },
  mounted() {
    this.computeBrowserWidth()
    window.addEventListener("resize", this.computeBrowserWidth)
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.computeBrowserWidth)
  },
  methods: {
    computeBrowserWidth() {
      this.browserWidth = Helpers.getBrowserWidth()
    },
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
      this.$emit("change-page", pageNodeId)
    },
    toggleMenu() {
      // Only animate the enter/leave if triggered by the toggle button
      this.animate = true
      this.opened = !this.opened
    },
    scrollToRef(nodeId) {
      this.$nextTick(() => {
        const container = document.querySelector(
          `#multicontent-container .media-container`
        )
        const yOffset = -50
        const element = document.getElementById(`row-${nodeId}`)
        const y =
          element.getBoundingClientRect().top -
          container.getBoundingClientRect().top +
          container.scrollTop +
          yOffset
        container.scrollTo({ top: y, behavior: "smooth" })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-nav-toggle {
  background-color: transparent;
  padding: 0;
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 11;

  &.fullscreen {
    top: 40px;
    @media screen and (min-width: 801px) {
      display: none;
    }
  }
}

.page-nav-wrapper {
  position: relative;
  z-index: 0;
  min-width: 200px;

  &.lightbox {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 11;
    border-radius: 15px 0 0 15px;
  }

  &.fullscreen {
    position: absolute;
    height: 100vh;
    margin: -24px 24px 0 -24px;
    z-index: 11;

    .page-nav {
      padding: 4rem 1.5rem 3rem 1.5rem;
    }

    @media screen and (min-width: 801px) {
      position: relative;
    }
  }

  &.unit-child {
    width: 250px;
    max-width: 25vw;
  }

  .page-nav {
    color: #ffffff;
    background: #5d656c;
    padding: 2.2rem 1.5rem;
    font-size: 14px;
    text-align: left;
    overflow-y: auto;
    display: flex;
    flex-direction: column;

    @media screen and (min-width: 960px) {
      font-size: clamp(14px, 1.3vw, 16px);
    }

    .page-nav {
      text-align: left;
    }

    .page-nav-content {
      &:first-child {
        margin-top: 9em;
      }

      .page-menu-items {
        margin-left: 2em;
        margin-right: -0.5em;
      }
    }

    .logout-link {
      color: #ffffff;
    }
  }
}

$slide-fade-speed: 0.3s;

.slide-fade-enter-active {
  animation: slide-fade $slide-fade-speed ease;

  &.page-nav {
    animation: slide-fade $slide-fade-speed ease;
  }
}
.slide-fade-leave-active {
  animation: slide-fade $slide-fade-speed ease reverse;

  &.page-nav {
    animation: slide-fade $slide-fade-speed ease reverse;
  }
}

@keyframes slide-fade {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
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

    .dropdown-item.active,
    .dropdown-item:active {
      color: #ffffff;
      background-color: var(--highlight-color);
    }

    .disabled-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: gray;
      cursor: not-allowed;
    }
  }
}
</style>
