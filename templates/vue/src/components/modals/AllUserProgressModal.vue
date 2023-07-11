<template>
  <b-modal
    id="all-user-progress-modal"
    class="all-user-progress-modal"
    data-qa="all-user-progress-modal"
    :visible="show"
    size="xl"
    title="View All User Progress"
    scrollable
    body-class="p-0"
    hide-footer
    @hidden="$emit('close')"
  >
    <b-container fluid class="px-0">
      <div class="modal-content">
        <b-table
          class="progress-table"
          responsive
          :fields="fields"
          :items="allUserProgress"
        >
          <template #cell()="data">
            <div v-if="data.field.nonProgressField">{{ data.value }}</div>
            <div v-else>
              <circular-progress
                :value="data.value.progress"
                show-percentage
                :animated="false"
                completed-color="#28a745"
                completed-label="Completed"
              />
            </div>
          </template>
        </b-table>
      </div>
    </b-container>
  </b-modal>
</template>

<script>
import client from "@/services/TapestryAPI"
import { mapState } from "vuex"
import CircularProgress from "@/components/common/CircularProgress"

export default {
  name: "all-user-progress-modal",
  components: {
    CircularProgress,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      allUserProgress: [],
    }
  },
  computed: {
    ...mapState(["nodes"]),
    fields() {
      return [
        {
          key: "userId",
          label: "User ID",
          sortable: true,
          nonProgressField: true,
        },
        {
          key: "displayName",
          label: "User Name",
          sortable: true,
          nonProgressField: true,
        },
        ...Object.keys(this.nodes).map(key => {
          return {
            key: key,
            label: this.nodes[key].title,
          }
        }),
      ]
    },
  },
  mounted() {
    client.getAllUserProgress().then(response => {
      this.allUserProgress = response.data
    })
  },
  methods: {
    closeModal() {
      this.$emit("close")
    },
  },
}
</script>

<style scoped>
.modal-content,
.progress-table {
  height: 70vh;
}
</style>
