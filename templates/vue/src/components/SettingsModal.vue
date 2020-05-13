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
        <b-tab title="TYDE">
          <b-form-group
            label="Spaceship Cockpit Background"
            description="Add a background for the spaceship cockpit"
          >
            <file-upload
              v-model="spaceshipBackgroundUrl"
              placeholder="Enter the URL for the background"
            />
          </b-form-group>
        </b-tab>
        <b-tab title="Profile">
          <slick-list
            :value="profileActivities"
            lock-axis="y"
            @input="updateProfileOrdering"
          >
            <slick-item
              v-for="(activity, index) in profileActivities"
              :key="index"
              :index="index"
              class="slick-list-item"
              style="z-index: 9999 !important;"
            >
              <b-row align-v="center" class="m-0">
                <b-input-group class="mb-3">
                  <b-input-group-prepend is-text>
                    <span class="fas fa-bars fa-xs"></span>
                  </b-input-group-prepend>
                  <b-form-group class="mb-0" style="flex:auto;">
                    <combobox
                      :key="`profile-${index}-${activity.activityRef}`"
                      :value="activity.activityRef"
                      :options="activities"
                      item-text="text"
                      item-value="id"
                      placeholder="Choose activity"
                      empty-message="There are no activities yet."
                      class="mb-0"
                      @input="profileActivities[index].activityRef = $event"
                    >
                      <template v-slot="slotProps">
                        <p>
                          {{ slotProps.option.text }}
                        </p>
                      </template>
                    </combobox>
                  </b-form-group>
                  <b-input-group-append>
                    <b-button
                      size="md"
                      variant="danger"
                      style="height: calc(2.2em + 3px);"
                      @click="deleteActivity(index)"
                    >
                      Delete
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-row>
            </slick-item>
          </slick-list>
          <b-row class="mx-0">
            <b-button variant="primary" @click="addActivity">
              <i class="fas fa-plus icon"></i>
              Add Activity
            </b-button>
          </b-row>
        </b-tab>
        <b-tab title="Access">
          <h6 class="mb-3 text-muted">Default Permissions For New Nodes</h6>
          <permissions-table
            :order="permissionsOrder"
            :initial-default="initialDefault"
            @updated="handleUpdatedPermission"
          />
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
import { mapGetters, mapState } from "vuex"
import FileUpload from "./FileUpload"
import Combobox from "../components/Combobox"
import { SlickList, SlickItem } from "vue-slicksort"
import PermissionsTable from "./node-modal/PermissionsTable"

export default {
  name: "settings-modal",
  components: {
    FileUpload,
    Combobox,
    SlickList,
    SlickItem,
    PermissionsTable,
  },
  props: {
    wpCanEditTapestry: {
      type: Boolean,
      required: false,
      default: false,
    },
    permissionsOrder: {
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
      backgroundUrl: "",
      autoLayout: false,
      nodeDraggable: true,
      spaceshipBackgroundUrl: "",
      profileActivities: [],
      userId: "",
      showAccess: true,
      defaultPermissions: this.initialDefault,
    }
  },
  computed: {
    ...mapState(["nodes"]),
    ...mapGetters(["settings"]),
    activities() {
      return this.nodes.filter(node => Boolean(node.quiz)).flatMap(node => node.quiz)
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
    addActivity() {
      this.profileActivities = [
        ...this.profileActivities,
        {
          activityRef: null,
        },
      ]
    },
    deleteActivity(index) {
      this.profileActivities.splice(index, 1)
    },
    updateProfileOrdering(arr) {
      this.profileActivities = [...arr]
    },
    getSettings() {
      const {
        backgroundUrl = "",
        autoLayout = false,
        nodeDraggable = true,
        spaceshipBackgroundUrl = "",
        profileActivities = [],
        defaultPermissions = this.defaultPermissions,
        showAccess = true,
      } = this.settings
      this.backgroundUrl = backgroundUrl
      this.autoLayout = autoLayout
      this.nodeDraggable = nodeDraggable
      this.spaceshipBackgroundUrl = spaceshipBackgroundUrl
      this.profileActivities = profileActivities
      this.defaultPermissions = defaultPermissions
      this.showAccess = showAccess
    },
    async updateSettings() {
      const settings = Object.assign(this.settings, {
        backgroundUrl: this.backgroundUrl,
        autoLayout: this.autoLayout,
        nodeDraggable: this.nodeDraggable,
        spaceshipBackgroundUrl: this.spaceshipBackgroundUrl,
        profileActivities: this.profileActivities,
        defaultPermissions: this.defaultPermissions,
        showAccess: this.showAccess,
      })
      console.log(settings)
      await this.$store.dispatch("updateSettings", settings)
      // TODO: Improve behavior so refresh is not required (currently auto-layout and setting the background image only happen initially)
      // this.$emit("settings-updated", settings);
      // this.closeModal();
      location.reload()
    },
    handleUpdatedPermission(newPerm) {
      this.defaultPermissions = newPerm
    },
  },
}
</script>

<style lang="scss" scoped></style>
