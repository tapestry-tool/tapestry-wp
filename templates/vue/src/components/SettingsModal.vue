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
              @isUploading="isUploading"
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
      <b-button size="sm" variant="secondary" @click="closeModal">
        Cancel
      </b-button>
      <b-button
        id="save-button"
        size="sm"
        variant="primary"
        :disabled="fileUploading"
        @click="updateSettings"
      >
        <b-spinner v-if="fileUploading"></b-spinner>
        <div :style="!fileUploading ? '' : 'opacity: 50%;'">Save</div>
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

export default {
  name: "settings-modal",
  components: {
    FileUpload,
    DuplicateTapestryButton,
    PermissionsTable,
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
      userId: "",
      showAccess: true,
      defaultPermissions,
      fileUploading: false,
      defaultDepth: 3,
    }
  },
  computed: {
    ...mapGetters(["tapestryJson"]),
    ...mapState(["settings", "rootId", "tapestryIsLoaded"]),
    maxDepth() {
      if (this.tapestryIsLoaded) {
        return thisTapestryTool.findMaxDepth(this.rootId) + 1
      }
      return 0
    },
  },
  created() {
    if (this.settings.defaultPermissions) {
      this.defaultPermissions = this.settings.defaultPermissions
    }
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
        defaultPermissions = this.defaultPermissions,
        showAccess = true,
        defaultDepth = 3,
      } = this.settings
      this.backgroundUrl = backgroundUrl
      this.autoLayout = autoLayout
      this.nodeDraggable = nodeDraggable
      this.defaultPermissions = defaultPermissions
      this.showAccess = showAccess
      this.defaultDepth = defaultDepth
    },
    async updateSettings() {
      const settings = Object.assign(this.settings, {
        backgroundUrl: this.backgroundUrl,
        autoLayout: this.autoLayout,
        nodeDraggable: this.nodeDraggable,
        defaultPermissions: this.defaultPermissions,
        showAccess: this.showAccess,
        defaultDepth: parseInt(this.defaultDepth),
      })
      await this.$store.dispatch("updateSettings", settings)
      // TODO: Improve behavior so refresh is not required (currently auto-layout and setting the background image only happen initially)
      // this.$emit("settings-updated", settings);
      // this.closeModal();
      location.reload()
    },
    isUploading(status) {
      this.fileUploading = status
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
