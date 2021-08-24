<template>
  <li :class="{ disabled: disabled }">
    <div @mouseover="hovered = true" @mouseleave="hovered = false">
      <span class="page-menu-item-title fa-li">
        <i
          :class="
            disabled
              ? 'fas fa-lock'
              : hovered || contentHovered
              ? 'fas fa-circle'
              : 'far fa-circle'
          "
        />
      </span>
      <span class="page-nav-title" @click="nestedItemClick">
        {{ node.typeData.menuTitle ? node.typeData.menuTitle : node.title }}
      </span>
    </div>
    <ul class="page-menu-item fa-ul">
      <page-menu-item
        v-for="row in rows"
        v-show="isMultiContentChild(row.node)"
        :key="row.node.id"
        :node="row.node"
        :depth="depth + 1"
        :lock-rows="lockRows"
        :disabled="disabled || disableRow(row.node)"
        @item-click="itemClick"
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
    }
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getNode", "isMultiContent", "getParent"]),
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
    contentHovered() {
      return this.node.id === this.$route.query.row
    },
    disabledFrom() {
      return this.rows.findIndex(row => !row.node.completed)
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
    nestedItemClick() {
      this.itemClick()
    },
    itemClick(nodeId) {
      if (typeof nodeId === "undefined" || !nodeId) {
        nodeId = this.node.id
      }
      this.$router.push({
        ...this.$route,
        query: { ...this.$route.query, row: nodeId },
      })
      this.$emit("item-click", nodeId)
      this.$emit("scroll-to", nodeId)
    },
    isMultiContentChild(node) {
      return this.getNode(this.getParent(node.id)).mediaType === "multi-content"
    },
  },
}
</script>

<style lang="scss" scoped>
.page-menu-item {
  &.fa-ul {
    margin-top: 1.5em;
    margin-bottom: 1.5em;
    background-color: red;
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
    .page-nav-title {
      cursor: pointer;
    }
  }
}
</style>
