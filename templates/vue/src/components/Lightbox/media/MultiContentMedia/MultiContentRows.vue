<template>
  <div data-qa="multi-content-rows" class="multi-content-rows">
    <b-row :class="(node.presentationStyle === 'page' ? 'mr' : 'ml') + '-0'">
      <multi-content-row
        v-for="(row, index) in rows"
        :id="`row-${row.node.id}`"
        :key="row.node.id"
        class="my-2 mb-1"
        :node="row.node"
        :children="row.children"
        :parent="node"
        :index="index"
        :condition-node="
          index > 0 && nonPopupRows[index - 1] ? nonPopupRows[index - 1].node : {}
        "
        :presentation-style="node.presentationStyle || 'accordion'"
        :disabled="disableRow(index, row.node)"
        :dimensions="dimensions"
        :context="context"
        :level="level"
        @update-progress="updateProgress"
        @load="handleLoad"
        @close="handleAutoClose"
      />
    </b-row>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"

export default {
  name: "multi-content-rows",
  components: {
    MultiContentRow: () => import("./MultiContentRow"),
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    dimensions: {
      type: Object,
      required: true,
    },
    context: {
      type: String,
      required: false,
      default: "",
    },
    level: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      showCompletion: false,
    }
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getNode", "isFavourite", "isMultiContent"]),
    ...mapState(["favourites"]),
    rows() {
      return this.node.childOrdering.map(id => {
        const node = this.getNode(id)
        const children = this.isMultiContent(node.id)
          ? node.childOrdering.map(this.getNode)
          : this.getDirectChildren(id).map(this.getNode)
        return { node, children }
      })
    },
    lockRows() {
      return this.node.typeData.lockRows
    },
    nonPopupRows() {
      return this.rows.filter(row => row.node.popup === null)
    },
    disabledFrom() {
      return this.rows.findIndex(row => !row.node.completed)
    },
  },
  methods: {
    handleLoad(el) {
      this.$emit("load", el)
    },
    disableRow(index, node) {
      return (
        (this.lockRows && this.disabledFrom >= 0 && index > this.disabledFrom) ||
        !node.unlocked
      )
    },
    updateProgress(rowId) {
      this.$emit("updateProgress", rowId)
    },
    changeRow(rowInfo) {
      this.$emit("changeRow", { context: this.context, ...rowInfo })
    },
    areAllPopup(nodes) {
      return nodes.every(node => node.popup !== null)
    },
    handleAutoClose() {
      this.$emit("close")
    },
  },
}
</script>

<style lang="scss" scoped></style>
