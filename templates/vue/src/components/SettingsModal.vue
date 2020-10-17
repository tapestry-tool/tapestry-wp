<template>
  <b-modal
    id="settings-modal"
    v-model="show"
    size="lg"
    title="Tapestry Settings"
    scrollable
    body-class="p-0"
  >
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
            label="Users can move nodes"
            description="If enabled, you allow users to move nodes to different positions on the screen.
              However, changes made by the users won't be saved."
          >
            <b-form-checkbox v-model="nodeDraggable" switch>
              {{ nodeDraggable ? "Enabled" : "Disabled" }}
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
            <p class="my-2 p-0 text-muted small">
              <strong>Note:</strong>
              You will need to refresh the page to see this change applied.
            </p>
          </b-form-group>
          <b-form-group label="Default Depth" class="mb-0">
            <b-form-input
              v-model="defaultDepth"
              class="depth-slider"
              type="range"
              min="0"
              :max="maxDepth || 3"
            ></b-form-input>
            <p class="my-2 p-0 text-muted small">
              <strong>Note:</strong>
              You will need to refresh the page to see this change applied.
            </p>
            <div class="depth-slider-description">
              Set to 0 to disable depth change. Selected depth: {{ defaultDepth }}
            </div>
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
        <b-tab title="Advanced">
          <b-form-group
            label="Export/Duplicate"
            description="Export your tapestry to a file and then you can import it on another site. 
              Duplicating will create a copy of this tapestry on this site."
          >
            <b-row class="mb-2">
              <b-col>
                <b-button block variant="light" @click="exportTapestry">
                  Export Tapestry
                </b-button>
              </b-col>
              <b-col>
                <duplicate-tapestry-button />
              </b-col>
            </b-row>
          </b-form-group>
          <b-form-group
            class="mt-4"
            label="Show thumbnails"
            description="When disabled, node thumbnails will not be rendered on the screen. Turning this off may improve performance."
          >
            <b-form-checkbox v-model="renderImages" switch>
              {{ renderImages ? "Enabled" : "Disabled" }}
            </b-form-checkbox>
          </b-form-group>
        </b-tab>
        <b-tab title="Access">
          <b-form-group
            label="Default Permissions For New Nodes"
            description="Newly created nodes in this tapestry will have these permissions by default."
          >
            <permissions-table v-model="defaultPermissions" />
          </b-form-group>
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
        <div :style="!fileUploading ? '' : 'opacity: 50%;'">Submit</div>
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapGetters, mapState } from "vuex"
import { bus } from "@/utils/event-bus"
import FileUpload from "./FileUpload"
import DuplicateTapestryButton from "./settings-modal/DuplicateTapestryButton"
import PermissionsTable from "./node-modal/PermissionsTable"
import Combobox from "../components/Combobox"
import { SlickList, SlickItem } from "vue-slicksort"

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
    Combobox,
    SlickList,
    SlickItem,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      backgroundUrl: "",
      nodeDraggable: true,
      userId: "",
      showAccess: true,
      defaultPermissions,
      spaceshipBackgroundUrl: "",
      profileActivities: [],
      fileUploading: false,
      superuserOverridePermissions: true,
      defaultDepth: 3,
      maxDepth: 0,
      renderImages: true,
    }
  },
  computed: {
    ...mapGetters(["tapestryJson"]),
    ...mapState(["nodes", "settings", "rootId"]),
    activities() {
      return Object.values(this.nodes)
        .filter(node => Boolean(node.quiz))
        .flatMap(node => node.quiz)
    },
  },
  created() {
    if (this.settings.defaultPermissions) {
      this.defaultPermissions = this.settings.defaultPermissions
    }
  },
  mounted() {
    this.getSettings()
    bus.$on("max-depth-change", depth => (this.maxDepth = depth))
  },
  methods: {
    closeModal() {
      this.$emit("close")
    },
    getSettings() {
      const {
        backgroundUrl = "",
        autoLayout = false,
        nodeDraggable = true,
        defaultPermissions = this.defaultPermissions,
        showAccess = true,
        spaceshipBackgroundUrl = "",
        profileActivities = [],
        superuserOverridePermissions = true,
        defaultDepth = 3,
        renderImages = true,
      } = this.settings
      this.backgroundUrl = backgroundUrl
      this.autoLayout = autoLayout
      this.nodeDraggable = nodeDraggable
      this.defaultPermissions = defaultPermissions
      this.showAccess = showAccess
      this.spaceshipBackgroundUrl = spaceshipBackgroundUrl
      this.profileActivities = profileActivities
      this.superuserOverridePermissions = superuserOverridePermissions
      this.defaultDepth = defaultDepth
      this.renderImages = renderImages
    },
    async updateSettings() {
      const settings = Object.assign(this.settings, {
        backgroundUrl: this.backgroundUrl,
        autoLayout: this.autoLayout,
        nodeDraggable: this.nodeDraggable,
        defaultPermissions: this.defaultPermissions,
        showAccess: this.showAccess,
        spaceshipBackgroundUrl: this.spaceshipBackgroundUrl,
        profileActivities: this.profileActivities,
        superuserOverridePermissions: this.superuserOverridePermissions,
        defaultDepth: parseInt(this.defaultDepth),
        renderImages: this.renderImages,
      })
      await this.$store.dispatch("updateSettings", settings)
      this.closeModal()
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

.spinner {
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

#save-button {
  position: relative;

  &:disabled {
    pointer-events: none;
    cursor: not-allowed;
  }

  > span {
    position: absolute;
    height: 1.5em;
    width: 1.5em;
    left: 33%;
  }
}
</style>
