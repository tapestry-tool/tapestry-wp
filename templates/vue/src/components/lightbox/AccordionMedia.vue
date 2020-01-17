<template>
  <div ref="container">
    <h1 class="title">{{ node.title }}</h1>
    <div v-for="row in rows" :key="row.id" no-body>
      <b-button block @click="toggle(row.id)">{{ row.title }}</b-button>
      <b-collapse :id="row.id" :accordion="`accordion-${node.id}`">
        <tapestry-media :node-id="row.id" :dimensions="dimensions" />
      </b-collapse>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TapestryMedia from "../TapestryMedia"

export default {
  name: "accordion-media",
  components: {
    TapestryMedia,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getDirectChildren", "getNode"]),
    rows() {
      return this.getDirectChildren(this.node.id).map(this.getNode)
    },
    dimensions() {
      const box = this.$refs.container
      if (!box) {
        return {}
      }
      const rect = box.getBoundingClientRect()
      return { width: rect.width, height: rect.height }
    },
  },
  methods: {
    toggle(id) {
      this.$root.$emit("bv::toggle::collapse", id)
    },
  },
}
</script>

<style lang="scss" scoped>
.title {
  color: #fff;
}
</style>
