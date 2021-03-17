<template>
  <div class="page-menu">
    <div class="page-menu-item" :style="indent">
      <div class="page-menu-title">
        <div
          v-if="node.childOrdering.length > 0"
          class="page-toggle"
          @click.stop="toggleChildren"
        >
          <tapestry-icon :icon="showChildren ? 'chevron-down' : 'chevron-up'" />
        </div>
        <tapestry-icon v-if="shouldDisable" icon="lock" />
        <div
          :class="['content-title', { active: active === node.id }]"
          @click="handleTitleClick"
        >
          {{ node.title }}
        </div>
      </div>
      <div v-if="showChildren" class="page-menu-wrapper">
        <page-menu
          v-for="row in rows"
          :key="row.node.id"
          :node="row.node"
          :active="active"
          :depth="depth + 1"
          :lockRows="lockRows"
          :shouldDisable="shouldDisable || disableRow(row.node.id)"
          @scroll-to="scrollToRow"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TapestryIcon from "@/components/common/TapestryIcon"

export default {
  name: "page-menu",
  components: {
    TapestryIcon,
  },
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
  },
  data() {
    return {
      showChildren: false,
    }
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getNode", "isMultiContent"]),
    indent() {
      return { transform: `translate(${this.depth * 20}px` }
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
    disabledFrom() {
      return this.rows.findIndex(row => !row.node.completed)
    },
  },
  methods: {
    toggleChildren() {
      this.showChildren = !this.showChildren
    },
    handleTitleClick() {
      this.setActive()
      this.scrollToRow()
    },
    scrollToRow(nodeId) {
      if (!nodeId) {
        nodeId = this.node.id
      }
      this.$emit("scroll-to", nodeId)
    },
    setActive() {
      if (this.$route.query.row !== this.node.id) {
        this.$router.push({
          ...this.$route,
          query: { ...this.$route.query, row: this.node.id },
        })
      }
    },
    disableRow(nodeId) {
      const index = this.rows.findIndex(row => row.node.id === nodeId)
      return this.lockRows && this.disabledFrom >= 0 && index > this.disabledFrom
    },
  },
}
</script>

<style lang="scss" scoped>
.page-menu-title {
  display: inline-flex;
}
.page-toggle {
  margin-right: 8px;
}
.content-title {
  margin-left: 8px;
}
.active {
  font-weight: bold;
  text-decoration-line: underline;
}
</style>
