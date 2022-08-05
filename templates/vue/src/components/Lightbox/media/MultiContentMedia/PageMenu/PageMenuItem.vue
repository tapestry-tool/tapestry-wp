<template>
  <li
    v-if="
      (node.unlocked || !node.hideWhenLocked) &&
        (node.typeData.menuTitle || node.title).trim().length
    "
    :class="{ disabled: disabled }"
  >
    <div
      class="page-menu-item-wrapper"
      @mouseover="hovered = true"
      @mouseleave="hovered = false"
      @click="handleTitleClick"
    >
      <span class="page-menu-item-title fa-li">
        <i
          :class="
            disabled
              ? 'fas fa-lock'
              : hovered || contentSelected
              ? 'fas fa-circle'
              : 'far fa-circle'
          "
        />
      </span>
      <span class="page-nav-title">
        {{ node.typeData.menuTitle ? node.typeData.menuTitle : node.title }}
      </span>
    </div>
    <ul class="page-menu-item fa-ul">
      <page-menu-item
        v-for="row in rows"
        :key="row.node.id"
        :node="row.node"
        :depth="depth + 1"
        :lockRows="lockRows"
        :disabled="disabled || disableRow(row.node)"
        @selected="handleChildSelected"
        @scroll-to="scrollToRow"
      />
    </ul>
  </li>
</template>

<script>
/**
 * The `<page-menu-item>` component is a child component used in PageMenu used recursively
 * for nested navigation.
 */
import { mapGetters } from "vuex"

export default {
  name: "page-menu-item",
  props: {
    node: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
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
  },
  data() {
    return {
      showChildren: false,
      hovered: false,
      childrenSelected: [],
    }
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getNode", "isMultiContent"]),
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
    contentSelected() {
      return this.node.id === this.$route.params.row || this.childrenSelected.length
    },
    disabledFrom() {
      return this.rows.findIndex(row => !row.node.completed)
    },
  },
  watch: {
    contentSelected(selected) {
      this.$emit("selected", { nodeId: this.node.id, selected })
    },
  },
  methods: {
    disableRow(node) {
      const index = this.rows.findIndex(row => row.node.id === node.id)
      return (
        (this.lockRows && this.disabledFrom >= 0 && index > this.disabledFrom) ||
        !node.unlocked
      )
    },
    handleTitleClick() {
      this.scrollToRow()
    },
    handleChildSelected({ nodeId, selected }) {
      const childIndex = this.childrenSelected.findIndex(el => el === nodeId)
      if (selected && childIndex < 0) {
        this.childrenSelected.push(nodeId)
      } else if (!selected && childIndex >= 0) {
        this.childrenSelected.splice(childIndex, 1)
      }
    },
    scrollToRow(nodeId) {
      if (!nodeId) {
        nodeId = this.node.id
      }
      this.$emit("scroll-to", nodeId)
      this.$router.push({
        ...this.$route,
        params: { ...this.$route.params, rowId: nodeId },
        query: this.$route.query,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-menu-item-wrapper {
  cursor: pointer;
}
.page-menu-item {
  &.fa-ul {
    margin-top: 1.5em;
    margin-bottom: 1.5em;
  }

  li {
    margin-bottom: 1.5em;
    &.disabled {
      opacity: 0.5;
    }
    &-item {
      > i {
        vertical-align: middle;
        font-size: 0.5rem;
      }
    }
  }
}
</style>
