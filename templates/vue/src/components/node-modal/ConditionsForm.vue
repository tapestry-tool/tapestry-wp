<template>
  <b-tab title="Unlock Conditions">
    <b-row class="mx-0 mb-3">
      <b-button variant="primary" @click="addCondition">
        <i class="fas fa-plus icon"></i>
        Add Condition
      </b-button>
    </b-row>
    <b-card
      v-for="(condition, idx) in conditions"
      :key="`${condition.type}-${idx}`"
      bg-variant="light"
      class="mb-2"
    >
      <b-form-group label="Node">
        <b-form-select
          v-model="condition.value"
          :options="nodeOptions"
        ></b-form-select>
      </b-form-group>
      <b-form-group label="Condition">
        <b-form-select
          v-model="condition.type"
          :options="conditionOptions"
        ></b-form-select>
      </b-form-group>
    </b-card>
  </b-tab>
</template>

<script>
import { mapState } from "vuex"
import { conditionTypes } from "@/utils/constants"

const baseCondition = {
  type: conditionTypes.NODE_COMPLETED,
  value: 0,
}

export default {
  name: "conditions-form",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      conditions: [],
    }
  },
  computed: {
    ...mapState(["nodes"]),
    nodeOptions() {
      return this.nodes.map(node => ({
        value: node.id,
        text: node.title,
      }))
    },
    conditionOptions() {
      return [
        {
          value: conditionTypes.NODE_COMPLETED,
          text: "Completed",
        },
      ]
    },
  },
  watch: {
    conditions(val) {
      this.node.conditions = val
    },
  },
  mounted() {
    this.conditions = this.node.conditions || []
  },
  methods: {
    addCondition() {
      this.conditions.push({ ...baseCondition })
    },
  },
}
</script>
