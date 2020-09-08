<template>
  <div>
    <b-form-group class="mb-3">
      <b-form-checkbox v-model="lock">
        Prevent access until specified conditions are met
      </b-form-checkbox>
      <b-form-invalid-feedback :force-show="lock">
        Please note: Currently, locked nodes cannot be unlocked by users who are not
        logged in.
      </b-form-invalid-feedback>
    </b-form-group>
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
        <b-form-group label="Unlock this node">
          <b-form-select
            v-model="condition.type"
            :options="conditionOptions"
          ></b-form-select>
        </b-form-group>
        <b-form-group
          v-if="condition.type === conditionTypes.NODE_COMPLETED"
          label="Node"
        >
          <b-form-select
            v-model="condition.nodeId"
            :options="nodeOptions"
          ></b-form-select>
        </b-form-group>
        <b-row
          v-if="
            condition.type === conditionTypes.DATE_PASSED ||
              condition.type === conditionTypes.DATE_NOT_PASSED
          "
        >
          <b-col>
            <b-form-group label="Date">
              <b-form-datepicker
                v-model="condition.date"
                class="datepicker"
              ></b-form-datepicker>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group label="Time">
              <b-form-timepicker
                v-model="condition.time"
                class="datepicker"
              ></b-form-timepicker>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group label="Timezone">
              <b-form-select
                v-model="condition.timezone"
                :options="timezoneOptions"
              ></b-form-select>
            </b-form-group>
          </b-col>
        </b-row>
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
import moment from "moment-timezone"
import { mapState } from "vuex"
import { conditionTypes } from "@/utils/constants"

const baseCondition = {
  type: conditionTypes.NODE_COMPLETED,
  nodeId: 0,
  date: null,
  time: null,
  timezone: moment.tz.guess(),
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
      return Object.values(this.nodes)
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
          text: "When another node is completed",
        },
        {
          value: conditionTypes.DATE_PASSED,
          text: "After a set date/time",
        },
        {
          value: conditionTypes.DATE_NOT_PASSED,
          text: "Until a set date/time",
        },
      ]
    },
    conditionTypes() {
      return conditionTypes
    },
    timezoneOptions() {
      return moment.tz.names()
    },
  },
  watch: {
    conditions(val) {
      this.node.conditions = val
      this.lock = val.length > 0
    },
    lock(isLocked) {
      if (!isLocked) {
        this.node.conditions = []
      }
    },
  },
  mounted() {
    const conditions = this.node.conditions || []
    this.conditions = conditions.map(condition => ({
      ...baseCondition,
      ...condition,
    }))
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

  .condition-close-button {
    background: none;
    margin: 0;
    padding: 0;
    position: absolute;
    top: 8px;
    right: 12px;
    color: rgba(0, 0, 0, 0.5);
  }
}
</style>

<style lang="scss">
.datepicker {
  button:hover {
    background: none !important;
  }
}
</style>
