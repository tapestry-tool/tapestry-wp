<template>
  <div id="modal-permissions">
    <b-form-group label="Sub-items">
      <b-table-simple
        class="text-center mb-0"
        striped
        responsive
        data-qa="sub-item-table"
      >
        <b-tbody>
          <b-tr v-for="nodeId in node.childOrdering" :key="nodeId">
            <b-td class="text-left text-capitalize">
              {{ getNode(nodeId).title }}
            </b-td>
            <b-td class="text-right">
              <b-link @click="handleEdit(nodeId)">Edit</b-link>
            </b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>
      <p v-if="requiresSaving" class="my-2 p-0 text-muted small">
        To enable add sub-item, please save this node.
      </p>
      <div class="buttons-container">
        <b-button
          class="add-subitem-button"
          data-qa="add-subitem"
          variant="primary"
          :disabled="requiresSaving"
          @click="addSubitem"
        >
          <i class="fas fa-plus icon"></i>
          Add Sub-item
        </b-button>
        <b-button
          v-if="requiresSaving"
          class="save-node-button"
          data-qa="save-node-button"
          variant="primary"
          @click="handleSave"
        >
          Save
        </b-button>
      </div>
    </b-form-group>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import { names } from "@/config/routes"

export default {
  name: "sub-item-table",
  props: {
    node: {
      type: Object,
      required: true,
    },
    actionType: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["getNode"]),
    requiresSaving() {
      return this.actionType === "add"
    },
  },
  methods: {
    addSubitem() {
      this.$router.push({
        name: names.MODAL,
        params: { nodeId: this.node.id, type: "add", tab: "content" },
        query: this.$route.query,
      })
    },
    handleEdit(nodeId) {
      this.$router.push({
        name: names.MODAL,
        params: { nodeId: nodeId, type: "edit", tab: "content" },
        query: this.$route.query,
      })
    },
    handleSave() {
      this.$root.$emit("add-node")
    },
  },
}
</script>

<style lang="scss">
.buttons-container {
  margin-top: 20px;
}
</style>
