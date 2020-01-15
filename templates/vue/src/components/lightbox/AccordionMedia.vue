<template>
  <div>
    <h1>{{ node.title }}</h1>
    <b-card v-for="row in rows" :key="row.id" no-body>
      <b-card-header>
        <b-button block @click="toggle(row.id)">{{ row.title }}</b-button>
      </b-card-header>
      <b-collapse :id="row.id" :accordion="`accordion-${node.id}`">
        <b-card-body>
          <b-card-text>{{ row.description }}</b-card-text>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  name: "accordion-media",
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
  },
  methods: {
    toggle(id) {
      this.$root.$emit("bv::toggle::collapse", id)
    },
  },
}
</script>
