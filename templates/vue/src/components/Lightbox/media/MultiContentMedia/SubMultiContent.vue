<template>
  <sub-page
    v-if="row.children.length > 0 && row.node.presentationStyle === 'page'"
    :dimensions="dimensions"
    :rows="row.children"
    :row-id="subRowId"
    @load="handleLoad"
  ></sub-page>
  <sub-accordion
    v-else
    :dimensions="dimensions"
    :rows="row.children"
    :row-id="subRowId"
    @load="handleLoad"
  ></sub-accordion>
</template>

<script>
import SubAccordion from "./SubAccordion"
import SubPage from "./SubPage"

export default {
  name: "page-rows",
  components: {
    SubPage,
    SubAccordion,
  },
  props: {
    row: {
      type: Object,
      required: true,
    },
    rowId: {
      type: Number,
      required: true,
    },
    subRowId: {
      type: Number,
      required: false,
      default: 0,
    },
    dimensions: {
      type: Object,
      required: true,
    },
  },
  methods: {
    handleLoad(el) {
      console.log(el)
      this.$emit("load", el)
    },
  },
}
</script>
