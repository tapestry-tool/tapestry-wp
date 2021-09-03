<template>
  <b-card>
    <b-card-text v-b-toggle="canToggleMenu" @click="handleTitleClick">
      {{ node.title }}
    </b-card-text>
    <b-collapse :id="`collapse-${index}`" :visible="index === 0" class="mt-2">
      <ul v-for="row in menu" :key="row.node.id" class="page-menu-item fa-ul">
        <page-menu-item
          :node="row.node"
          :lock-rows="lockRows"
          :disabled="disabledRow(row.node)"
          @item-click="handleItemClick"
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
    lockRows: {
      type: Boolean,
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
    index: {
      type: Number,
      required: true,
    },
  },
  computed: {
    disabledFrom() {
      return this.rows.findIndex(row => !row.node.completed)
    },
    canToggleMenu() {
      return this.index === 0 || this.menu.length === 0
        ? ``
        : `collapse-${this.index}`
    },
  },
  methods: {
    disabledRow(node) {
      const rowIndex = this.rows.findIndex(row => row.node.id === node.id)
      return (
        (this.lockRows && this.disabledFrom >= 0 && rowIndex > this.disabledFrom) ||
        !node.unlocked
      )
    },
    handleTitleClick() {
      const pageMenuData = {
        menuIndex: this.index,
        nodeId: this.node.id,
        context: "",
      }
      this.$emit("title-click", pageMenuData)
    },
    handleItemClick(nodeId) {
      const pageMenuData = {
        menuIndex: this.index,
        nodeId: nodeId,
        context: this.menuIndex === 0 ? "" : "multi-content",
      }
      this.$emit("title-click", pageMenuData)
      this.$emit("scroll-to", nodeId)
    },
  },
}
</script>
