<template>
  <b-modal
    id="settings-modal"
    v-model="showModal"
    size="lg"
    title="Tapestry Settings"
    body-class="p-0"
    @hidden="close"
  >
    <b-container fluid class="px-0">
      <b-tabs card :value="tabIndex" @input="handleTabChange">
        <b-tab title="Appearance">
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
          <b-form-group
            label="Show me all nodes by default"
            description="If enabled, editors of this tapestry would be able to view all nodes even if they have 
            the 'read' permission off. If disabled, superusers will be able to use the filter to view such nodes, 
            but they won't appear in the tapestry by default. Note: Editors of this tapestry include users with 
            the Administator or Editor role, and the author of this Tapestry."
          >
            <b-form-checkbox v-model="superuserOverridePermissions" switch>
              {{ superuserOverridePermissions ? "Enabled" : "Disabled" }}
            </b-form-checkbox>
          </b-form-group>
          <b-form-group v-if="tapestryIsLoaded" label="Default Depth">
            <b-form-input
              v-model="defaultDepth"
              class="depth-slider"
              type="range"
              min="0"
              :max="maxDepth || 3"
            ></b-form-input>
            <div class="depth-slider-description">
              Set to 0 to disable depth change. Selected depth: {{ defaultDepth }}
            </div>
          </b-form-group>
        </b-tab>
        <b-tab title="Advanced">
          <b-button block variant="light" @click="exportTapestry">
            Export Tapestry
          </b-button>
          <duplicate-tapestry-button style="margin-top: 12px;" />
        </b-tab>
        <b-tab title="Access">
          <h6 class="mb-3 text-muted">Default Permissions For New Nodes</h6>
          <permissions-table v-model="defaultPermissions" />
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
      <b-button size="sm" variant="secondary" @click="showModal = false">
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
import DuplicateTapestryButton from "./settings-modal/DuplicateTapestryButton"
import PermissionsTable from "./node-modal/PermissionsTable"

const defaultPermissions = Object.fromEntries(
  [
    "public",
    "authenticated",
    ...Object.keys(wpData.roles).filter(
      role => role !== "administrator" && role !== "author"
    ),
  ].map(rowName => [rowName, ["read"]])
)

const tabOrdering = ["appearance", "advanced", "access"]

const defaultSettings = {
  backgroundUrl: "",
  autoLayout: false,
  nodeDraggable: true,
  showAccess: true,
  superuserOverridePermissions: true,
  defaultDepth: 3,
}

export default {
  name: "settings-modal",
  components: {
    FileUpload,
    DuplicateTapestryButton,
    PermissionsTable,
  },
  props: {
    tab: {
      type: String,
      required: false,
      default: "",
    },
  },
  data() {
    return {
      backgroundUrl: "",
      autoLayout: false,
      nodeDraggable: true,
      userId: "",
      showAccess: true,
      defaultPermissions,
      showModal: true,
      currentTab: this.tab,
      superuserOverridePermissions: true,
      defaultDepth: 3,
    }
  },
  computed: {
    ...mapGetters(["settings", "tapestryJson"]),
    ...mapState(["settings", "rootId", "tapestryIsLoaded"]),
    wpCanEditTapestry() {
      return wpApiSettings && wpApiSettings.wpCanEditTapestry === "1"
    },
    maxDepth() {
      if (this.tapestryIsLoaded) {
        return thisTapestryTool.findMaxDepth(this.rootId) + 1
      }
      return 0
    },
    tabIndex() {
      const tabIndex = tabOrdering.findIndex(t => t === this.currentTab)
      return this.currentTab === "" || tabIndex === -1 ? 0 : tabIndex
    },
  },
  watch: {
    $route(to, from) {
      if (this.currentTab !== to.params.tab && to !== from) {
        this.currentTab = to.params.tab
      }
    },
  },
  created() {
    if (this.settings.defaultPermissions) {
      this.defaultPermissions = this.settings.defaultPermissions
    }
  },
  mounted() {
    this.getSettings()
    this.synchronizeSettings()
  },
  methods: {
    close() {
      this.$router.push(`/`)
    },
    getSettings() {
      const {
        backgroundUrl = "",
        autoLayout = false,
        nodeDraggable = true,
        defaultPermissions = this.defaultPermissions,
        showAccess = true,
        superuserOverridePermissions = true,
        defaultDepth = 3,
      } = this.settings
      this.backgroundUrl = backgroundUrl
      this.autoLayout = autoLayout
      this.nodeDraggable = nodeDraggable
      this.defaultPermissions = defaultPermissions
      this.showAccess = showAccess
      this.superuserOverridePermissions = superuserOverridePermissions
      this.defaultDepth = defaultDepth
    },
    async updateSettings() {
      this.close()
      const settings = Object.assign(this.settings, {
        backgroundUrl: this.backgroundUrl,
        autoLayout: this.autoLayout,
        nodeDraggable: this.nodeDraggable,
        defaultPermissions: this.defaultPermissions,
        showAccess: this.showAccess,
        superuserOverridePermissions: this.superuserOverridePermissions,
        defaultDepth: parseInt(this.defaultDepth),
      })
      await this.$store.dispatch("updateSettings", settings)
      // TODO: Improve behavior so refresh is not required (currently auto-layout and setting the background image only happen initially)
      // this.$emit("settings-updated", settings);
      // this.closeModal();
      location.reload()
    },
    exportTapestry() {
      const tapestry = this.tapestryJson
      const blob = new Blob([JSON.stringify(tapestry, null, 2)], {
        type: "application/json",
      })
      const fileUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = fileUrl
      a.download = `${this.settings.title}.json`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(fileUrl)
      document.body.removeChild(a)
    },
    synchronizeSettings() {
      const tapestrySettings = this.settings
      for (const setting in defaultSettings) {
        if (!tapestrySettings.hasOwnProperty(setting)) {
          this.updateSettings()
        }
      }
    },
    handleTabChange(newTabIndex) {
      this.currentTab = tabOrdering[newTabIndex]
      this.$router.push("/settings/" + this.currentTab).catch(err => {})
    },
  },
}
</script>

<style lang="scss" scoped>
.depth-slider {
  border: none;
  padding: 0;
  max-width: 350px;
}

.depth-slider-description {
  color: #6c757d;
  font-size: 80%;
}
</style>
