<template>
  <b-modal id="settings-modal" size="lg" title="Tapestry Settings" body-class="p-0">
    <b-container fluid class="px-0">
      <b-tabs card>
        <b-tab title="Appearance" active>
          <b-form-group
            label="Background URL"
            description="Add a background image to the page where this tapestry
              appears."
          >
            <file-upload
              id="background-url"
              v-model="backgroundUrl"
              placeholder="Enter background URL"
              autofocus
            />
          </b-form-group>
          <b-form-group
            v-show="wpCanEditTapestry"
            label="Users can move nodes"
            description="If enabled, you allow users to move nodes to different positions on the screen.
              However, changes made by the users won't be saved."
          >
            <b-form-checkbox v-model="nodeDraggable" switch>
              {{ nodeDraggable ? "Enabled" : "Disabled" }}
            </b-form-checkbox>
          </b-form-group>
          <b-form-group
            label="Auto-Layout"
            description="With auto-layout enabled, nodes will place themselves in
              the best position possible. If this is disabled, you will need to manually place the nodes where
              you want them to appear."
          >
            <b-form-checkbox v-model="autoLayout" switch>
              {{ autoLayout ? "Enabled" : "Disabled" }}
            </b-form-checkbox>
          </b-form-group>
        </b-tab>
        <b-tab title="Access">
          <h6 class="mb-3 text-muted">Default Permissions For New Nodes</h6>
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
                <b-tr
                  v-for="(value, rowName) in permissions"
                  :key="rowName"
                  :value="value"
                >
                  <b-th class="text-left text-capitalize">{{ rowName }}</b-th>
                  <b-td>
                    <b-form-checkbox
                      v-model="defaultPermissions[rowName]"
                      value="read"
                      :disabled="isPermissionDisabled(rowName, 'read')"
                      :data-testid="`node-permissions-${rowName}-read`"
                      @change="updatePermissions($event, rowName, 'read')"
                    ></b-form-checkbox>
                  </b-td>
                  <b-td>
                    <b-form-checkbox
                      v-model="defaultPermissions[rowName]"
                      value="add"
                      :disabled="isPermissionDisabled(rowName, 'add')"
                      :data-testid="`node-permissions-${rowName}-add`"
                      @change="updatePermissions($event, rowName, 'add')"
                    ></b-form-checkbox>
                  </b-td>
                  <b-td>
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
          <b-form-group
            label="Show Access Tab"
            description="When shown, users will see the Access tab when adding or editing a node
              and can change the permissions for each node that they add. Hiding the Access tab 
              will hide it from all users except you, editors of this tapestry, and admins."
          >
            <b-form-checkbox v-model="showAccess" switch>
              {{ showAccess ? "Show" : "Hide" }}
            </b-form-checkbox>
          </b-form-group>
        </b-tab>
      </b-tabs>
    </b-container>
    <template slot="modal-footer">
      <p class="mb-0 p-0 text-muted small">
        <strong>Note:</strong>
        Page will refresh when you save to apply your new settings.
      </p>
      <span style="flex-grow:1;"></span>
      <b-button size="sm" variant="secondary" @click="closeModal">
        Cancel
      </b-button>
      <b-button size="sm" variant="primary" @click="updateSettings">
        Save
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapGetters } from "vuex"
import FileUpload from "./FileUpload"
export default {
  name: "settings-modal",
  components: {
    FileUpload,
  },
  props: {
    wpCanEditTapestry: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      backgroundUrl: "",
      autoLayout: false,
      nodeDraggable: true,
      defaultPermissions: {
        public: ["read"],
        authenticated: ["read"],
      },
      permissionsOrder: [
        "public",
        "authenticated",
        ...Object.keys(wpData.roles).filter(
          role => role !== "administrator" && role !== "author"
        ),
      ],
      userId: "",
      showAccess: true,
    }
  },
  computed: {
    ...mapGetters(["settings"]),
    permissions() {
      const ordered = {}
      this.permissionsOrder.forEach(permission => {
        ordered[permission] = this.defaultPermissions[permission]
      })
      return ordered
    },
  },
  mounted() {
    window.addEventListener("open-settings-modal", this.openModal)
  },
  beforeDestroy() {
    window.removeEventListener("open-settings-modal")
  },
  methods: {
    openModal() {
      this.$bvModal.show("settings-modal")
      this.getSettings()
    },
    closeModal() {
      this.$bvModal.hide("settings-modal")
    },
    getSettings() {
      const {
        backgroundUrl = "",
        autoLayout = false,
        nodeDraggable = true,
        defaultPermissions = {
          public: ["read"],
          authenticated: ["read"],
        },
        showAccess = true,
      } = this.settings
      this.backgroundUrl = backgroundUrl
      this.autoLayout = autoLayout
      this.nodeDraggable = nodeDraggable
      this.defaultPermissions = defaultPermissions
      this.showAccess = showAccess
    },
    async updateSettings() {
      const settings = Object.assign(this.settings, {
        backgroundUrl: this.backgroundUrl,
        autoLayout: this.autoLayout,
        nodeDraggable: this.nodeDraggable,
        defaultPermissions: this.defaultPermissions,
        showAccess: this.showAccess,
      })
      await this.$store.dispatch("updateSettings", settings)
      // TODO: Improve behavior so refresh is not required (currently auto-layout and setting the background image only happen initially)
      // this.$emit("settings-updated", settings);
      // this.closeModal();
      location.reload()
    },
    updatePermissions(value, rowName, type) {
      if (rowName.startsWith("user") || wpData.roles.hasOwnProperty(rowName)) {
        return this.changeIndividualPermission(value, rowName, type)
      }
      const rowIndex = this.getPermissionRowIndex(rowName)
      const lowerPriorityPermissions = this.permissionsOrder.slice(rowIndex + 1)
      lowerPriorityPermissions.forEach(newRow => {
        this.changeIndividualPermission(value, newRow, type)
      })
    },
    getPermissionRowIndex(rowName) {
      return this.permissionsOrder.findIndex(thisRow => thisRow === rowName)
    },
    isPermissionDisabled(rowName, type) {
      if (rowName == "public") {
        return false
      }
      // keep going up until we find a non-user higher row
      const rowIndex = this.getPermissionRowIndex(rowName)
      const higherRow = this.permissionsOrder[rowIndex - 1]
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
        this.$set(this.node.permissions, `user-${userId}`, this.newPermissions)
        this.permissionsOrder.push(`user-${userId}`)
        this.userId = null
      } else {
        alert("Enter valid user id")
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
