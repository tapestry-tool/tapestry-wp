<template>
  <b-card>
    <b-card-text v-b-toggle="canToggleMenu" @click="titleClicked">
      {{ menuTitleNode.title }}
    </b-card-text>
    <b-collapse
      :id="`collapse-${menuIndex}`"
      :visible="menuIndex === 0"
      class="mt-2"
    >
      <ul v-for="row in menu" :key="row.node.id" class="page-menu-item fa-ul">
        <page-menu-item
          :node="row.node"
          :lock-rows="lockRows"
          :disabled="disabledRow(row.node)"
          @item-click="itemClicked"
        />
      </ul>
    </b-collapse>
  </b-card>
</template>

<script>
import PageMenuItem from "./PageMenuItem"

export default {
  name: "menu-group",
  components: {
    PageMenuItem,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    rows: {
      type: Array,
      required: true,
    },
    menu: {
      type: Array,
      required: true,
    },
    menuTitleNode: {
      type: Object,
      required: true,
    },
    menuIndex: {
      type: Number,
      required: true,
    },
  },
  computed: {
    lockRows() {
      return this.node.typeData.lockRows
    },
    disabledFrom() {
      return this.rows.findIndex(row => !row.node.completed)
    },
    canToggleMenu() {
      return this.menuIndex === 0 || this.menu.length === 0
        ? ``
        : `collapse-${this.menuIndex}`
    },
  },
  methods: {
    disabledRow(node) {
      const index = this.rows.findIndex(row => row.node.id === node.id)
      return (
        (this.lockRows && this.disabledFrom >= 0 && index > this.disabledFrom) ||
        !node.unlocked
      )
    },
    titleClicked() {
      const pageMenuData = {
        menuIndex: this.menuIndex,
        nodeId: this.menuTitleNode.id,
        context: this.menuIndex === 0 ? "" : "page",
      }
      this.$emit("menu-click", pageMenuData)
    },
    itemClicked(nodeId) {
      const pageMenuData = {
        menuIndex: this.menuIndex,
        nodeId: nodeId,
        context: "multi-content",
      }
      this.$emit("menu-click", pageMenuData)
      this.$emit("scroll-to", nodeId)
    },
  },
}
</script>

<style lang="scss">
.page-menu-item {
  background-color: blue;
}
</style>
