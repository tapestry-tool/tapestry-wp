<template>
  <div id="modal-permissions">
    <b-form-group label="Sub-items">
      <b-table-simple class="text-center mb-0" striped responsive>
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
      <div class="buttons-container">
        <b-button
          class="add-subitem-button"
          data-qa="add-subitem"
          variant="primary"
          @click="addSubitem"
        >
          <i class="fas fa-plus icon"></i>
          Add Sub-item
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
  },
  computed: {
    ...mapGetters(["getNode"]),
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
  },
}
</script>

<style lang="scss">
.add-subitem-button {
  margin-top: 0.5rem;
}
</style>
