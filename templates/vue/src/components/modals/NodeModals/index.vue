<template>
  <div>
    <node-permissions-modal></node-permissions-modal>
    <node-lock-modal></node-lock-modal>
  </div>
</template>

<script>
import NodePermissionsModal from "./NodePermissionsModal"
import NodeLockModal from "./NodeLockModal"

export default {
  name: "node-modals",
  components: {
    NodePermissionsModal,
    NodeLockModal,
  },
}
</script>
