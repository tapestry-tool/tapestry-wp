<template>
  <div id="modal-permissions">
    <b-table-simple class="text-center mb-0" striped responsive>
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
          <b-td v-for="type in types" :key="type" class="text-center">
            <b-form-checkbox
              :checked="permissionsList.includes(type)"
              :disabled="isPermissionOverridden(rowName, type)"
              :data-testid="`node-permissions-${rowName}-${type}`"
              @change="updatePermissions($event, rowName, type)"
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
              <b-button variant="secondary" @click="addUserPermissionRow">
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
import { data } from "@/services/wp"

const PERMISSIONS_ORDER = [
  "public",
  "authenticated",
  ...Object.keys(data.roles).filter(
    role => role !== "editor" && role !== "administrator" && role !== "author"
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
      addedByUser: new Set(),
    }
  },
  computed: {
    permissions() {
      const orderedPermissions = []
      PERMISSIONS_ORDER.forEach((permission, index) => {
        if (this.value.hasOwnProperty(permission)) {
          orderedPermissions.push([permission, this.value[permission]])
        } else {
          const higherPermission = PERMISSIONS_ORDER[index - 1]
          orderedPermissions.push([permission, this.value[higherPermission]])
        }
      })
      return orderedPermissions
    },
  },
  mounted() {
    this.$emit("input", Object.fromEntries(this.permissions))
  },
  created() {
    this.types = ["read", "add", "edit"]
    for (const [rowName, permissionsList] of this.permissions) {
      for (const type of permissionsList) {
        this.addedByUser.add(`${rowName}-${type}`)
      }
    }
  },
  methods: {
    cascade(isChecked, rowName, type, newPermissions) {
      if (this.shouldCascade(rowName)) {
        const rowIndex = this.getPermissionRowIndex(rowName)
        const lowerPriorityPermissions = this.permissions.slice(rowIndex + 1)
        lowerPriorityPermissions.forEach(newRow => {
          const key = `${newRow[0]}-${type}`
          isChecked ? this.addedByUser.add(key) : this.addedByUser.delete(key)
          this.changeIndividualPermission(isChecked, newRow[0], type, newPermissions)
        })
      }
    },
    updatePermissions(isChecked, rowName, type) {
      const newPermissions = Object.fromEntries(this.permissions)
      this.changeIndividualPermission(isChecked, rowName, type, newPermissions)
      this.cascade(isChecked, rowName, type, newPermissions)

      if (type === "add" || type === "edit") {
        const currentPermissions = newPermissions[rowName]
        const key = `${rowName}-read`
        if (isChecked) {
          if (!currentPermissions.includes("read")) {
            currentPermissions.push("read")
            this.cascade(isChecked, rowName, "read", newPermissions)
          }
        } else if (
          !this.addedByUser.has(key) &&
          !currentPermissions.find(type => type === "add" || type === "edit")
        ) {
          newPermissions[rowName] = currentPermissions.filter(
            perm => perm !== "read"
          )
          this.cascade(isChecked, rowName, "read", newPermissions)
        }
      }

      this.$emit("input", newPermissions)
    },
    isPermissionOverridden(rowName, type) {
      const currentPermissions = this.permissions[
        this.getPermissionRowIndex(rowName)
      ][1]

      // We don't support node additions or editing for public users
      if (rowName === "public" && (type === "add" || type === "edit")) {
        return true
      }

      if (
        type === "read" &&
        (currentPermissions.includes("add") || currentPermissions.includes("edit"))
      ) {
        return true
      }

      // If the row is the first in order, it should never be overridden
      if (rowName === PERMISSIONS_ORDER[0]) {
        return false
      }

      const publicPermissions = this.permissions.find(
        permList => permList[0] === "public"
      )

      if (rowName === "authenticated") {
        return publicPermissions && publicPermissions[1].includes(type)
      }

      const authenticatedPermissions = this.permissions.find(
        permList => permList[0] === "authenticated"
      )

      if (!publicPermissions || !authenticatedPermissions) {
        return false
      }

      return (
        publicPermissions[1].includes(type) ||
        authenticatedPermissions[1].includes(type)
      )
    },
    changeIndividualPermission(isChecked, rowName, type, permissionsObj) {
      const currentPermissions = permissionsObj[rowName] || []
      let newPermissions = [...currentPermissions]

      const key = `${rowName}-${type}`
      if (!isChecked) {
        if (
          type !== "read" ||
          !currentPermissions.find(perm => perm === "add" || perm === "edit")
        ) {
          newPermissions = currentPermissions.filter(
            permission => permission !== type
          )
        }
        this.addedByUser.delete(key)
      } else if (!currentPermissions.includes(type)) {
        newPermissions.push(type)
        this.addedByUser.add(key)
      }

      permissionsObj[rowName] = newPermissions
    },
    addUserPermissionRow() {
      const userId = this.userId
      if (userId && Helpers.onlyContainsDigits(userId) && this.userId != "") {
        const [higherRow, higherRowPermissions] = this.permissions[
          this.permissions.length - 1
        ]
        const newPermissions = Object.fromEntries(this.permissions)
        const newUserPermissions = []
        this.types
          .filter(
            type =>
              this.isPermissionOverridden(higherRow, type) &&
              higherRowPermissions.includes(type)
          )
          .forEach(type => newUserPermissions.push(type))
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
    shouldCascade(rowName) {
      return rowName === "public" || rowName === "authenticated"
    },
  },
}
</script>

<style lang="scss" scoped>
table {
  border: none;
  th {
    border-top: none;
  }
}
</style>
