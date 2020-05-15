<template>
  <div id="modal-permissions">
    <b-table-simple class="text-center" striped responsive>
      <b-thead>
        <b-tr>
          <b-th></b-th>
          <b-th>Read</b-th>
          <b-th>Add</b-th>
          <b-th>Edit</b-th>
        </b-tr>
      </b-thead>
      <b-tbody>
        <b-tr v-for="(value, rowName) in permissions" :key="rowName" :value="value">
          <b-th class="text-left text-capitalize">{{ rowName }}</b-th>
          <b-td class="text-center">
            <b-form-checkbox
              v-model="defaultPermissions[rowName]"
              value="read"
              :disabled="isPermissionDisabled(rowName, 'read')"
              :data-testid="`node-permissions-${rowName}-read`"
              @change="updatePermissions($event, rowName, 'read')"
            ></b-form-checkbox>
          </b-td>
          <b-td class="text-center">
            <b-form-checkbox
              v-model="defaultPermissions[rowName]"
              value="add"
              :disabled="isPermissionDisabled(rowName, 'add')"
              :data-testid="`node-permissions-${rowName}-add`"
              @change="updatePermissions($event, rowName, 'add')"
            ></b-form-checkbox>
          </b-td>
          <b-td class="text-center">
            <b-form-checkbox
              v-model="defaultPermissions[rowName]"
              value="edit"
              :disabled="isPermissionDisabled(rowName, 'edit')"
              :data-testid="`node-permissions-${rowName}-edit`"
              @change="updatePermissions($event, rowName, 'edit')"
            ></b-form-checkbox>
          </b-td>
        </b-tr>
        <b-tr>
          <b-td colspan="4">
            <b-input-group>
              <b-form-input
                v-model="userId"
                placeholder="Enter user ID"
              ></b-form-input>
              <b-button variant="secondary" @click="addUserPermissionRow()">
                <span class="fas fa-plus mr-1"></span>
                User
              </b-button>
            </b-input-group>
          </b-td>
        </b-tr>
      </b-tbody>
    </b-table-simple>
  </div>
</template>

<script>
import Helpers from "../../utils/Helpers"
export default {
  name: "permissions-table",
  props: {
    order: {
      type: Array,
      required: true,
    },
    initialDefault: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  data() {
    return {
      userId: "",
      defaultPermissions: this.initialDefault,
    }
  },
  computed: {
    permissions() {
      const ordered = {}
      this.order.forEach(permission => {
        ordered[permission] = this.defaultPermissions[permission]
      })
      return ordered
    },
  },
  mounted() {
    console.log(this.initialDefault)
  },
  methods: {
    updatePermissions(value, rowName, type) {
      if (rowName.startsWith("user") || wpData.roles.hasOwnProperty(rowName)) {
        const value = this.changeIndividualPermission(value, rowName, type)
        this.$emit("updated", this.defaultPermissions)
        return value
      }
      const rowIndex = this.getPermissionRowIndex(rowName)
      const lowerPriorityPermissions = this.order.slice(rowIndex + 1)
      lowerPriorityPermissions.forEach(newRow => {
        this.changeIndividualPermission(value, newRow, type)
      })
      this.$emit("updated", this.defaultPermissions)
    },
    isPermissionDisabled(rowName, type) {
      if (rowName == "public") {
        return false
      }
      // keep going up until we find a non-user higher row
      const rowIndex = this.getPermissionRowIndex(rowName)
      const higherRow = this.order[rowIndex - 1]
      if (higherRow.startsWith("user") || wpData.roles.hasOwnProperty(higherRow)) {
        return this.isPermissionDisabled(higherRow, type)
      }
      const permissions = this.defaultPermissions[higherRow]
      if (permissions) {
        return permissions.includes(type)
      }
      return false
    },
    changeIndividualPermission(value, rowName, type) {
      let currentPermissions = this.defaultPermissions[rowName]
      if (!currentPermissions) {
        currentPermissions = []
      }
      let newPermissions = [...currentPermissions]
      if (value) {
        if (!currentPermissions.includes(value)) {
          newPermissions.push(value)
        }
      } else {
        newPermissions = currentPermissions.filter(permission => permission !== type)
      }
      this.defaultPermissions[rowName] = newPermissions
    },
    addUserPermissionRow() {
      const userId = this.userId
      if (
        userId &&
        Helpers.onlyContainsDigits(userId) &&
        $("#user-" + userId + "-editcell").val() != ""
      ) {
        this.order.push(`user-${userId}`)
        const higherRow = this.order[
          this.getPermissionRowIndex(`user-${userId}`) - 1
        ]
        const higherRowPermissions = this.defaultPermissions[higherRow]
        this.defaultPermissions[`user-${userId}`] = [...higherRowPermissions]
        this.userId = null
        this.$emit("updated", this.defaultPermissions)
      } else {
        alert("Enter valid user id")
      }
    },
    getPermissionRowIndex(rowName) {
      return this.order.findIndex(thisRow => thisRow === rowName)
    },
  },
}
</script>

<style lang="scss" scoped></style>
