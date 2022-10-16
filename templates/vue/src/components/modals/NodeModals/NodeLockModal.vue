<template>
  <b-modal
    v-if="node"
    id="node-lock-modal"
    :visible="show"
    size="lg"
    scrollable
    aria-label="Lock Node"
    @hidden="closeModal"
  >
    <template #modal-title>
      <span>{{ node.title }}</span>
      <i class="fas fa-chevron-right fa-xs mx-2" />
      <span class="modal-name">Lock Node</span>
    </template>
    <b-container fluid>
      <div class="flex-row">
        <b-form-group class="mb-0">
          <b-form-checkbox v-model="lock">
            Prevent access until specified conditions are met
          </b-form-checkbox>
        </b-form-group>
        <b-form-group class="mb-0">
          <b-form-checkbox v-show="lock" v-model="node.hideWhenLocked" switch>
            {{ node.hideWhenLocked ? "Hide" : "Grey out" }}
          </b-form-checkbox>
        </b-form-group>
      </div>
      <b-alert :show="lock" variant="warning" class="mt-3">
        <em>
          Please note that locked nodes cannot be unlocked by users who are not
          logged in.
        </em>
      </b-alert>
      <div v-if="lock">
        <b-card
          v-for="(condition, idx) in node.conditions"
          :key="`${condition.type}-${idx}`"
          bg-variant="light"
          class="mb-3 condition-container"
        >
          <button class="condition-close-button" @click="removeCondition(idx)">
            <i class="fas fa-times"></i>
          </button>
          <b-form-group
            label="Unlock this node"
            :label-for="`condition-type-${idx}`"
          >
            <b-form-select
              :id="`condition-type-${idx}`"
              v-model="condition.type"
              data-qa="condition-type"
              :options="conditionOptions"
            ></b-form-select>
          </b-form-group>
          <b-form-group
            v-if="condition.type === conditionTypes.NODE_COMPLETED"
            label="Node"
            :label-for="`condition-id-${idx}`"
          >
            <b-form-select
              :id="`condition-id-${idx}`"
              v-model="condition.nodeId"
              data-qa="condition-id"
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
              <b-form-group label="Date" :label-for="`condition-date-${idx}`">
                <b-form-datepicker
                  :id="`condition-date-${idx}`"
                  v-model="condition.date"
                  data-qa="condition-date"
                  class="datepicker"
                ></b-form-datepicker>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Time" :label-for="`condition-time-${idx}`">
                <b-form-timepicker
                  :id="`condition-time-${idx}`"
                  v-model="condition.time"
                  class="datepicker"
                ></b-form-timepicker>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group
                label="Timezone"
                :label-for="`condition-timezone-${idx}`"
              >
                <b-form-select
                  :id="`condition-timezone-${idx}`"
                  v-model="condition.timezone"
                  :options="timezoneOptions"
                ></b-form-select>
              </b-form-group>
            </b-col>
          </b-row>
        </b-card>
        <b-row class="mx-0">
          <b-button data-qa="add-condition" variant="primary" @click="addCondition">
            <i class="fas fa-plus icon"></i>
            Add Condition
          </b-button>
        </b-row>
      </div>
    </b-container>
    <template slot="modal-footer">
      <b-button size="sm" variant="secondary" @click="closeModal">
        Cancel
      </b-button>
      <b-button size="sm" variant="primary" @click="handleSave">
        Save
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import moment from "moment-timezone"
import { conditionTypes } from "@/utils/constants"
import { names } from "@/config/routes"
import { mapState, mapGetters, mapActions } from "vuex"
import Helpers from "@/utils/Helpers"

const baseCondition = {
  type: conditionTypes.NODE_COMPLETED,
  nodeId: 0,
  date: null,
  time: null,
  timezone: moment.tz.guess(),
}

export default {
  name: "node-lock-modal",
  data() {
    return {
      conditionTypes,

      node: null,
      lock: false,
    }
  },
  computed: {
    ...mapState(["nodes"]),
    ...mapGetters(["getNode"]),
    show() {
      return this.$route.name === names.NODELOCK
    },
    nodeId() {
      return parseInt(this.$route.params.nodeId)
    },
    nodeOptions() {
      return Object.values(this.nodes)
        .filter(node => node.id !== this.nodeId)
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
    timezoneOptions() {
      return moment.tz.names()
    },
  },
  watch: {
    show: {
      handler(show) {
        if (show) {
          this.node = Helpers.deepCopy(this.getNode(this.nodeId))

          this.node.conditions = this.node.conditions.map(condition => ({
            ...baseCondition,
            ...condition,
          }))
          this.lock = this.node.conditions && this.node.conditions.length > 0
        }
      },
      immediate: true,
    },
    lock(lock) {
      if (!lock) {
        this.node.conditions = []
      }
    },
  },
  methods: {
    ...mapActions(["updateNode"]),
    addCondition() {
      this.node.conditions.push({ ...baseCondition })
      this.$nextTick(() => {
        document
          .getElementById(`condition-type-${this.node.conditions.length - 1}`)
          ?.focus()
      })
    },
    removeCondition(idx) {
      this.node.conditions.splice(idx, 1)
    },
    handleSave() {
      this.updateNode({
        id: this.node.id,
        newNode: this.node,
      }).then(() => {
        this.closeModal()
      })
    },
    closeModal() {
      this.$router.push({
        name: names.APP,
        params: { nodeId: this.nodeId },
        query: this.$route.query,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.modal-name {
  color: var(--tapestry-med-gray);
}

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

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
