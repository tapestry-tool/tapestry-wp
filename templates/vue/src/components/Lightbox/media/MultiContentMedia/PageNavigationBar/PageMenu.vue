<template>
  <ul class="page-menu fa-ul">
    <li class="page-menu-item">
      <span class="page-menu-title fa-li">
        <i v-if="shouldDisable" class="fas fa-lock page-menu-disabled" />
        <i v-else-if="isBase" class="far fa-circle" :style="bulletStyle" />
        <i v-else class="fas fa-circle" :style="bulletStyle" />
      </span>
      <span
        :class="[
          'page-nav-title',
          { active: active === node.id, 'page-menu-disabled': shouldDisable },
        ]"
        @click="handleTitleClick"
      >
        {{ node.typeData.menuTitle ? node.typeData.menuTitle : node.title }}
      </span>
    </li>
    <div v-if="!shouldDisable" class="page-menu-wrapper">
      <page-menu
        v-for="row in rows"
        :key="row.node.id"
        :node="row.node"
        :active="active"
        :depth="depth + 1"
        :lockRows="lockRows"
        :shouldDisable="shouldDisable || disableRow(row.node.id)"
        :isBase="false"
        @scroll-to="scrollToRow"
      />
    </div>
  </ul>
</template>

<script>
/**
 * The `<page-menu>` component is a child component used in PageNavigationBar used recursively
 * for nested navigation.
 */
import { mapGetters } from "vuex"

export default {
  name: "page-menu",
  props: {
    node: {
      type: Object,
      required: true,
    },
    active: {
      type: Number,
      required: false,
      default: -1,
    },
    depth: {
      type: Number,
      required: false,
      default: 0,
    },
    lockRows: {
      type: Boolean,
      required: false,
      default: false,
    },
    shouldDisable: {
      type: Boolean,
      required: false,
      default: false,
    },
    isBase: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      showChildren: false,
    }
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getNode", "isMultiContent"]),
    rows() {
      return this.node.childOrdering.map(id => {
        const node = this.getNode(id)
        const children = this.isMultiContent(node.id)
          ? node.childOrdering.map(this.getNode)
          : this.getDirectChildren(id).map(this.getNode)
        return { node, children }
      })
    },
    disabledFrom() {
      return this.rows.findIndex(row => !row.node.completed)
    },
    bulletStyle() {
      return {
        verticalAlign: "middle",
        fontSize: "0.5rem",
      }
    },
  },
  methods: {
    disableRow(nodeId) {
      const index = this.rows.findIndex(row => row.node.id === nodeId)
      return this.lockRows && this.disabledFrom >= 0 && index > this.disabledFrom
    },
    handleTitleClick() {
      this.scrollToRow()
    },
    scrollToRow(nodeId) {
      if (!nodeId) {
        nodeId = this.node.id
      }
      this.$emit("scroll-to", nodeId)
    },
  },
}
</script>

<style lang="scss" scoped>
.page-menu {
  &.fa-ul {
    margin-bottom: 1.5em;
  }

  .page-menu-item {
    margin-bottom: 1.5em;
  }

  .active {
    font-weight: bold;
    text-decoration-line: underline;
  }
  .page-menu-disabled {
    opacity: 0.5;
  }
  .page-nav-title {
    cursor: pointer;
  }
}
</style>
