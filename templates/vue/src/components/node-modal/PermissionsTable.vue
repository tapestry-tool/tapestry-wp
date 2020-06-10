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
        <b-tr v-for="[rowName, permissionsList] in permissions" :key="rowName">
          <b-th class="text-left text-capitalize">{{ rowName }}</b-th>
          <b-td class="text-center">
            <b-form-checkbox
              :checked="permissionsList"
              value="read"
              :disabled="isPermissionDisabled(rowName, 'read')"
              :data-testid="`node-permissions-${rowName}-read`"
              @change="updatePermissions($event, rowName, 'read')"
            ></b-form-checkbox>
          </b-td>
          <b-td class="text-center">
            <b-form-checkbox
              :checked="permissionsList"
              value="add"
              :disabled="isPermissionDisabled(rowName, 'add')"
              :data-testid="`node-permissions-${rowName}-add`"
              @change="updatePermissions($event, rowName, 'add')"
            ></b-form-checkbox>
          </b-td>
          <b-td class="text-center">
            <b-form-checkbox
              :checked="permissionsList"
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

const PERMISSIONS_ORDER = [
  "public",
  "authenticated",
  ...Object.keys(wpData.roles).filter(
    role => role !== "administrator" && role !== "author"
  ),
]

export default {
  name: "permissions-table",
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      userId: "",
    }
  },
  computed: {
    permissions() {
      const orderedPermissions = []
      PERMISSIONS_ORDER.forEach(permission => {
        if (this.value.hasOwnProperty(permission)) {
          orderedPermissions.push([permission, this.value[permission]])
        } else {
          orderedPermissions.push([permission, []])
        }
      })
      Object.entries(this.value)
        .filter(entry => {
          return !orderedPermissions.some(
            permissionMap => permissionMap[0] === entry[0]
          )
        })
        .forEach(entry => orderedPermissions.push(entry))
      return orderedPermissions
    },
  },
  methods: {
    updatePermissions(value, rowName, type) {
      const newPermissions = { ...this.value }
      this.changeIndividualPermission(value, rowName, type, newPermissions)
      if (this.shouldCascade(rowName, type)) {
        const rowIndex = this.getPermissionRowIndex(rowName)
        const lowerPriorityPermissions = this.permissions.slice(rowIndex + 1)
        lowerPriorityPermissions.forEach(newRow => {
          this.changeIndividualPermission(value, newRow[0], type, newPermissions)
        })
      }
      this.$emit("input", newPermissions)
    },
    isPermissionDisabled(rowName, type) {
      if (rowName == "public") {
        return false
      }
      // keep going up until we find a non-user higher row
      const rowIndex = this.getPermissionRowIndex(rowName)
      const higherRow = this.permissions[rowIndex - 1][0]
      if (higherRow.startsWith("user") || wpData.roles.hasOwnProperty(higherRow)) {
        return this.isPermissionDisabled(higherRow, type)
      }
      const permissions = this.value[higherRow]
      if (permissions) {
        return permissions.includes(type)
      }
      return false
    },
    changeIndividualPermission(value, rowName, type, permissionsObj) {
      let currentPermissions = permissionsObj[rowName]
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
      permissionsObj[rowName] = newPermissions
    },
    addUserPermissionRow() {
      const userId = this.userId
      if (userId && Helpers.onlyContainsDigits(userId) && this.userId != "") {
        const higherRow = this.permissions[this.permissions.length - 1][0]
        const higherRowPermissions = this.value[higherRow]
        const newPermissions = { ...this.value }
        const newUserPermissions = []
        const types = ["read", "add", "edit"]
        types
          .filter(type => this.shouldCascade(higherRow, type))
          .forEach(type => {
            if (higherRowPermissions.includes(type)) {
              newUserPermissions.push(type)
            }
          })
        newPermissions[`user-${userId}`] = newUserPermissions
        this.userId = null
        this.$emit("input", newPermissions)
      } else {
        alert("Enter valid user id")
      }
    },
    getPermissionRowIndex(rowName) {
      return this.permissions.findIndex(thisRow => thisRow[0] === rowName)
    },
    shouldCascade(rowName, type) {
      if (rowName === "public" || rowName === "authenticated") {
        return true
      }
      return this.isPermissionDisabled(rowName, type)
    },
  },
}
</script>

<style lang="scss" scoped></style>
