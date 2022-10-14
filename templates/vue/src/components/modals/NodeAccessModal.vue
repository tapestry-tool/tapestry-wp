<template>
  <b-modal
    v-if="node"
    id="node-access-modal"
    :visible="show"
    size="lg"
    title="Node Access"
    scrollable
    aria-label="Node Access Settings"
    @hidden="closeModal"
  >
    <b-container fluid>
      <!-- <h6 class="mt-4 mb-3">Lock Node</h6> -->
      <!-- <conditions-form /> -->
      <h6 class="mb-3">Node Permissions</h6>
      <b-card no-body>
        <permissions-table v-model="node.permissions" />
      </b-card>
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
import { names } from "@/config/routes"
import { mapActions, mapGetters } from "vuex"
import PermissionsTable from "./common/PermissionsTable"
import Helpers from "@/utils/Helpers"

export default {
  name: "node-access-modal",
  components: {
    PermissionsTable,
  },
  data() {
    return {
      node: null,
    }
  },
  computed: {
    ...mapGetters(["getNode"]),
    show() {
      return this.$route.name === names.NODEACCESS
    },
    nodeId() {
      return parseInt(this.$route.params.nodeId)
    },
  },
  watch: {
    show(show) {
      if (show) {
        this.node = Helpers.deepCopy(this.getNode(this.nodeId))
      }
    },
  },
  methods: {
    ...mapActions(["updateNode"]),
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

<style></style>
