<template>
  <div data-qa="multi-content-rows" class="multi-content-rows">
    <b-row
      v-if="!allHidden"
      :class="(node.presentationStyle === 'page' ? 'mr' : 'ml') + '-0'"
    >
      <multi-content-row
        v-for="(row, index) in rows"
        :id="`row-${row.node.id}`"
        :key="row.node.id"
        class="my-2 mb-1"
        :node="row.node"
        :children="row.children"
        :parent="node"
        :index="index"
        :condition-node="index > 0 && rows[index - 1] ? rows[index - 1].node : {}"
        :presentation-style="node.presentationStyle || 'accordion'"
        :disabled="disableRow(index, row.node)"
        :dimensions="dimensions"
        :context="context"
        :level="level"
        @complete="complete"
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
      numRowsLoaded: 0,
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
        const nonPopupChildren = children.filter(childNode => !childNode.popup)
        return { node, children: nonPopupChildren }
      })
    },
    allHidden() {
      return (
        this.level === 0 &&
        this.rows.length > 0 &&
        this.rows.every(row => !row.node.unlocked && row.node.hideWhenLocked)
      )
    },
    lockRows() {
      return this.node.typeData.lockRows
    },
    disabledFrom() {
      return this.rows.findIndex(row => !row.node.completed)
    },
  },
  methods: {
    handleLoad(el) {
      this.numRowsLoaded++
      if (this.numRowsLoaded == this.rows.length) {
        this.$emit("load", el)
      }
    },
    disableRow(index, node) {
      return (
        (this.lockRows && this.disabledFrom >= 0 && index > this.disabledFrom) ||
        !node.unlocked
      )
    },
    complete(rowId) {
      this.$emit("complete", rowId)
    },
    changeRow(rowInfo) {
      this.$emit("change-row", { context: this.context, ...rowInfo })
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
