<template>
  <b-dropdown right toggle-class="operations-button">
    <template #button-content>
      <i class="fas fa-ellipsis-h"></i>
    </template>
    <b-dropdown-item-button @click="open(names.EXPORTDUPLICATE)">
      Export/Duplicate Tapestry
    </b-dropdown-item-button>
    <b-dropdown-item-button @click="open(names.OTHEROPERATIONS)">
      Other Operations
    </b-dropdown-item-button>
    <export-duplicate-modal
      :show="openOperation === names.EXPORTDUPLICATE"
      @close="close(names.EXPORTDUPLICATE)"
    ></export-duplicate-modal>
    <other-operations-modal
      :show="openOperation === names.OTHEROPERATIONS"
      @close="close(names.OTHEROPERATIONS)"
    ></other-operations-modal>
  </b-dropdown>
</template>

<script>
import client from "@/services/TapestryAPI"
import ExportDuplicateModal from "@/components/modals/ExportDuplicateModal"
import OtherOperationsModal from "@/components/modals/OtherOperationsModal"
import { names } from "@/config/routes"

const operationModalNames = [names.EXPORTDUPLICATE, names.OTHEROPERATIONS]
const operationAnalyticsNames = {
  [names.EXPORTDUPLICATE]: "export-duplicate",
  [names.OTHEROPERATIONS]: "other-operations",
}

export default {
  components: {
    ExportDuplicateModal,
    OtherOperationsModal,
  },
  data: function() {
    return {
      names: names,
    }
  },
  computed: {
    openOperation: {
      get() {
        return operationModalNames.includes(this.$route.name)
          ? this.$route.name
          : null
      },
      set(operation) {
        this.$router.push({
          name: operation ?? names.APP,
          params: { nodeId: this.$route.params.nodeId },
          query: this.$route.query,
        })
      },
    },
  },
  methods: {
    open(operation) {
      this.openOperation = operation
      if (operation && operationAnalyticsNames[operation]) {
        client.recordAnalyticsEvent(
          "user",
          "open",
          operationAnalyticsNames[operation]
        )
      }
    },
    close(operation) {
      this.openOperation = null
      if (operation && operationAnalyticsNames[operation]) {
        client.recordAnalyticsEvent(
          "user",
          "close",
          operationAnalyticsNames[operation]
        )
      }
    },
  },
}
</script>

<style lang="scss">
.operations-button {
  padding: 0.5rem !important;
  background-color: transparent !important;
  border: 0 !important;
  font-size: 1.2em !important;
  transition: all 0.2s ease !important;
  color: #999 !important;

  &:focus,
  &:active,
  &:hover {
    background-color: transparent !important;
    outline: none;
    box-shadow: none !important;
  }
  &:hover {
    color: var(--highlight-color) !important;
    transform: scale(1.1);
  }

  &::after {
    content: none !important;
  }
}

.operations-button:only-child {
  margin-right: 12px;
}
</style>
