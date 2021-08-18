<template>
  <b-container>
    <div v-for="(menu, index) in filteredMenuGroups" :key="index" class="py-1">
      <b-card>
        <b-card-text
          v-b-toggle="index === 0 || menu.length === 0 ? `` : `collapse-${index}`"
          @click="handleMenuTitleClick(index)"
        >
          {{ getMenuName(index) }}
        </b-card-text>
        <b-collapse :id="`collapse-${index}`" :visible="index === 0" class="mt-2">
          <ul class="page-menu-item fa-ul">
            <page-menu-item
              v-for="row in menu"
              :key="row.node.id"
              :node="row.node"
              :lock-rows="lockRows"
              :disabled="disabled"
              @scroll-to="scrollTo"
              @handle-menu-item-click="handleMenuItemClick"
            />
          </ul>
        </b-collapse>
      </b-card>
    </div>
  </b-container>
</template>

<script>
import { mapGetters } from "vuex"
import PageMenuItem from "./PageMenuItem"
export default {
  name: "menu-groups",
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
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    ...mapGetters(["getParent"]),
    lockRows() {
      return this.node.typeData.lockRows
    },
    disabledFrom() {
      return this.rows.findIndex(row => !row.node.completed)
    },
    menuGroups() {
      const menu = []
      const mainMenu = []
      this.rows.forEach(row => {
        row.node.typeData.isSecondaryNode ? menu.push([row]) : mainMenu.push(row)
      })
      menu.unshift(mainMenu)
      return menu
    },
    filteredMenuGroups() {
      const filteredMenu = []
      this.menuGroups.forEach((menu, mIndex) => {
        if (mIndex === 0) {
          filteredMenu.push(menu)
        } else {
          let childrenNodes = menu[0].children
          const newMenu = []
          childrenNodes.forEach(childNode => {
            let newRow = {
              children: [],
              node: childNode,
            }
            newMenu.push(newRow)
          })
          filteredMenu.push(newMenu)
        }
      })
      return filteredMenu
    },
    menuTitleNodeIds() {
      let menuTitleNodeIds = []
      menuTitleNodeIds.push(this.node.id)
      this.rows.forEach(row => {
        if (row.node.typeData.isSecondaryNode) {
          menuTitleNodeIds.push(row.node.id)
        }
      })
      return menuTitleNodeIds
    },
  },
  mounted() {
    this.handleMenuTitleClick(0)
  },
  methods: {
    disabledRow(node) {
      const index = this.rows.findIndex(row => row.node.id === node.id)
      return (
        (this.lockRows && this.disabledFrom >= 0 && index > this.disabledFrom) ||
        !node.unlocked
      )
    },
    scrollTo(nodeId) {
      this.$emit("scroll-to", nodeId)
    },
    getMenuName(index) {
      return index === 0 ? this.node.title : this.menuGroups[index][0].node.title
    },
    getMenuIndexFromNodeId(nodeId) {
      let match = this.menuTitleNodeIds.findIndex(id => id === nodeId)
      return match > -1 ? match : this.getMenuIndexFromNodeId(this.getParent(nodeId))
    },
    getNodeIdFromMenuIndex(index) {
      return index === 0 ? this.node.id : this.menuGroups[index][0].node.id
    },
    handleMenuTitleClick(index) {
      const pageMenuData = {
        menuIndex: index,
        nodeId: this.getNodeIdFromMenuIndex(index),
        context: index === 0 ? "" : "page",
      }
      this.$emit("handle-page-menu-click", pageMenuData)
    },
    handleMenuItemClick(nodeId) {
      this.$router.push({
        ...this.$route,
        query: { ...this.$route.query, row: nodeId },
      })
      const pageMenuData = {
        menuIndex: this.getMenuIndexFromNodeId(nodeId),
        nodeId: nodeId,
        context: "multi-content",
      }
      this.$emit("handle-page-menu-click", pageMenuData)
    },
  },
}
</script>

<style scoped></style>
