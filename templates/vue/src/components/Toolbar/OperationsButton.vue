<template>
  <div>
    <b-dropdown
      id="operations-button"
      data-qa="operations-button"
      right
      variant="none"
      toggle-class="operations-button"
      :toggle-attrs="{
        'aria-label': 'Operations',
      }"
      menu-class="operations-menu"
    >
      <template #button-content>
        <i class="fas fa-ellipsis-h"></i>
        <b-badge
          v-if="showKalturaOption && notifications.kaltura.total !== 0"
          class="notification-badge"
          pill
          variant="danger"
        >
          {{ notifications.kaltura.total }}
        </b-badge>
      </template>
      <b-dropdown-item-button @click="open(names.EXPORTDUPLICATE)">
        Export/Duplicate Tapestry
      </b-dropdown-item-button>
      <b-dropdown-item-button
        v-if="showKalturaOption"
        @click="open(names.KALTURAMODAL)"
      >
        <div v-if="notifications.kaltura.total !== 0" class="kaltura-button">
          <div>Upload to Kaltura</div>
          <b-badge pill variant="danger">{{ notifications.kaltura.total }}</b-badge>
        </div>
        <template v-else>
          Upload to Kaltura
        </template>
      </b-dropdown-item-button>
      <b-dropdown-item-button @click="open(names.OTHEROPERATIONS)">
        Other Operations
      </b-dropdown-item-button>
    </b-dropdown>
    <export-duplicate-modal
      :show="openOperation === names.EXPORTDUPLICATE"
      @close="close(names.EXPORTDUPLICATE)"
    ></export-duplicate-modal>
    <kaltura-modal
      v-if="showKalturaOption"
      :show="openOperation === names.KALTURAMODAL"
      @close="close(names.KALTURAMODAL)"
    ></kaltura-modal>
    <other-operations-modal
      :show="openOperation === names.OTHEROPERATIONS"
      @close="close(names.OTHEROPERATIONS)"
    ></other-operations-modal>
  </div>
</template>

<script>
import client from "@/services/TapestryAPI"
import ExportDuplicateModal from "@/components/modals/ExportDuplicateModal"
import KalturaModal from "@/components/modals/KalturaModal"
import OtherOperationsModal from "@/components/modals/OtherOperationsModal"
import { names } from "@/config/routes"
import * as wp from "@/services/wp"
import Helpers from "@/utils/Helpers"
import { mapState } from "vuex"

const operationModalNames = [
  names.EXPORTDUPLICATE,
  names.OTHEROPERATIONS,
  names.KALTURAMODAL,
]
const operationAnalyticsNames = {
  [names.EXPORTDUPLICATE]: "export-duplicate",
  [names.KALTURAMODAL]: "kaltura-modal",
  [names.OTHEROPERATIONS]: "other-operations",
}
const defaultTabs = {
  [names.KALTURAMODAL]: "upload",
}

export default {
  components: {
    ExportDuplicateModal,
    KalturaModal,
    OtherOperationsModal,
  },
  data: function() {
    return {
      names: names,
    }
  },
  computed: {
    ...mapState(["notifications"]),
    openOperation: {
      get() {
        return operationModalNames.includes(this.$route.name)
          ? this.$route.name
          : null
      },
      set(operation) {
        this.$router.push({
          name: operation ?? names.APP,
          params: { nodeId: this.$route.params.nodeId, tab: defaultTabs[operation] },
          query: this.$route.query,
        })
      },
    },
    showKalturaOption() {
      return Helpers.hasKalturaUploadPermission() && wp.getKalturaStatus()
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
.operations-menu {
  button:active {
    background: var(--highlight-color);
    color: #fff !important;
  }
}

.operations-button {
  padding: 0.5rem !important; // Override Bootstrap button padding
  background: none;
  font-size: 1.2em;
  transition: all 0.2s ease;

  &::after {
    content: none !important; // Remove Bootstrap dropdown arrow
  }

  &:focus {
    background: none;
    outline: none;
    box-shadow: none !important; // Remove Bootstrap focus outline
  }

  &:hover {
    background: none;
    color: var(--highlight-color);
    transform: scale(1.1);
  }
}

.operations-button:only-child {
  margin-right: 12px;
}

.kaltura-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-badge {
  position: absolute !important;
  top: -2px !important;
  right: -3px !important;
  font-size: 0.7rem !important;
}
</style>
