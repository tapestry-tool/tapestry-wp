<template>
  <div>
    <label class="mb-3">
      <input v-model="lock" type="checkbox" />
      <span>Prevent access until specified conditions are met</span>
    </label>
    <div v-if="lock">
      <b-card
        v-for="(condition, idx) in conditions"
        :key="`${condition.type}-${idx}`"
        bg-variant="light"
        class="mb-2 condition-container"
      >
        <button class="condition-close-button" @click="removeCondition(idx)">
          <i class="fas fa-times"></i>
        </button>
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
      <b-row class="mx-0 mb-3">
        <b-button variant="primary" @click="addCondition">
          <i class="fas fa-plus icon"></i>
          Add Condition
        </b-button>
      </b-row>
    </div>
  </div>
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
      lock: false,
      conditions: [],
    }
  },
  computed: {
    ...mapState(["nodes"]),
    nodeOptions() {
      return this.nodes
        .filter(node => node.id !== this.node.id)
        .map(node => ({
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
    addCondition(e) {
      this.conditions.push({ ...baseCondition })
      e.target.blur()
    },
    removeCondition(idx) {
      this.conditions.splice(idx, 1)
    },
  },
}
</script>

<style lang="scss" scoped>
.condition-container {
  position: relative;
}

.condition-close-button {
  background: none;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 8px;
  right: 12px;
  color: rgba(0, 0, 0, 0.5);
}
</style>
