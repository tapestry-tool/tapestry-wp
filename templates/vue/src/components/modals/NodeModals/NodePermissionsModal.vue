<template>
  <b-modal
    v-if="node"
    id="node-permissions-modal"
    :visible="show"
    size="lg"
    scrollable
    aria-label="Node Permission Settings"
    @hidden="closeModal"
  >
    <template #modal-title>
      <span>{{ node.title }}</span>
      <i class="fas fa-chevron-right fa-xs mx-2" />
      <span class="modal-name">Node Permissions</span>
    </template>
    <b-container fluid>
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
import PermissionsTable from "../common/PermissionsTable"
import Helpers from "@/utils/Helpers"

export default {
  name: "node-permissions-modal",
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
      return this.$route.name === names.NODEPERMISSIONS
    },
    nodeId() {
      return parseInt(this.$route.params.nodeId)
    },
  },
  watch: {
    show: {
      handler(show) {
        if (show) {
          this.node = Helpers.deepCopy(this.getNode(this.nodeId))
        }
      },
      immediate: true,
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

<style lang="scss" scoped>
.modal-name {
  color: var(--tapestry-med-gray);
}
</style>
