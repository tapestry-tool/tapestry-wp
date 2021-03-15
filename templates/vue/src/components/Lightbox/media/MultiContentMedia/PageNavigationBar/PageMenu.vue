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
        <tapestry-icon 
          v-if="!node.unlocked"
          icon="lock"
        />
        <div class="content-title" @click="handleTitleClick">
          {{ node.title }}
        </div>
      </div>
      <div class="page-menu-wrapper" v-if="showChildren">
        <page-menu
          v-for="row in rows"
          :key="row.node.id"
          :node="row.node"
          :depth="depth + 1"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import TapestryIcon from "@/components/common/TapestryIcon"

export default { 
  name: 'page-menu',
  components: {
    TapestryIcon,
  },
  props: {
    node: {
      type: Object,
      required: false,
      default: null,
    },
    depth: {
      type: Number,
      required: false,
      default: 0,
    }
  },
  data() {
    return {
      showChildren: false,
    }
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getNode", "isMultiContent"]),
    indent() {
      return { transform: `translate(${this.depth * 20}px`}
    },
    rows() {
      return this.node.childOrdering.map(id => {
        const node = this.getNode(id)
        const children = this.isMultiContent(node.id)
          ? node.childOrdering.map(this.getNode)
          : this.getDirectChildren(id).map(this.getNode)
        return { node, children }
      })
    }
  },
  methods: {
    toggleChildren() {
      this.showChildren = !this.showChildren
    },
    handleTitleClick() {
      this.setActive()
      this.scrollToRow()
    },
    scrollToRow() {
      document.getElementById(`row-${this.node.id}`).scrollIntoView({
        behavior: "smooth",
      })
    },
    setActive() {
      if (this.$route.query.row !== this.node.id) {
        this.$router.push({
          ...this.$route,
          query: { ...this.$route.query, row: this.node.id },
        })
      }
    }
  }
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
</style>