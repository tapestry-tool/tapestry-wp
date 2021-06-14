<template>
  <div>
    <b-form-group class="mb-3">
      <b-form-checkbox v-model="lock">
        Enable dyad node behaviour
      </b-form-checkbox>
      <small id="emailHelp" class="form-text text-muted">
        When checked, you will be able to see your child's progress in this node.
        Only the child's progress will count towards this node's completion. 
      </small>
    </b-form-group>
  </div>
</template>

<script>
import moment from "moment-timezone";
import { mapState } from "vuex";
import { conditionTypes } from "@/utils/constants";

const baseCondition = {
  type: conditionTypes.NODE_COMPLETED,
  nodeId: 0,
  date: null,
  time: null,
  timezone: moment.tz.guess(),
};

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
    };
  },
  computed: {
    ...mapState(["nodes"]),
    nodeOptions() {
      return Object.values(this.nodes)
        .filter((node) => node.id !== this.node.id)
        .map((node) => ({
          value: node.id,
          text: node.title,
        }));
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
      ];
    },
    conditionTypes() {
      return conditionTypes;
    },
    timezoneOptions() {
      return moment.tz.names();
    },
  },
  watch: {
    conditions(val) {
      this.node.conditions = val;
      this.lock = val.length > 0;
    },
    lock(isLocked) {
      if (!isLocked) {
        this.node.conditions = [];
      }
    },
  },
  mounted() {
    const conditions = this.node.conditions || [];
    this.conditions = conditions.map((condition) => ({
      ...baseCondition,
      ...condition,
    }));
  },
  methods: {
    addCondition(e) {
      this.conditions.push({ ...baseCondition });
      e.target.blur();
    },
    removeCondition(idx) {
      this.conditions.splice(idx, 1);
    },
  },
};
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
