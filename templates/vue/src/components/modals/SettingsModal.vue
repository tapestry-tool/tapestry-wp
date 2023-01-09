<template>
  <b-modal
    id="settings-modal"
    data-qa="settings-modal"
    :visible="show"
    size="lg"
    title="Tapestry Settings"
    scrollable
    body-class="p-0"
    @hidden="$emit('close')"
  >
    <b-container fluid class="px-0">
      <b-tabs card>
        <b-tab
          title="Appearance"
          :active="tab === 'appearance'"
          @click="$emit('change:tab', 'appearance')"
        >
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
            label="Show me rejected nodes"
            description="If enabled, you will be able to see all submitted nodes that have previously been rejected. This may slightly hinder performance."
          >
            <b-form-checkbox v-model="showRejected" switch>
              {{ showRejected ? "Enabled" : "Disabled" }}
            </b-form-checkbox>
            <p class="my-2 p-0 text-muted small">
              <strong>Note:</strong>
              You will need to refresh the page to see this change applied.
            </p>
          </b-form-group>
          <b-form-group
            data-qa="superuser-override"
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
          <b-form-group
            label="Highlight accepted nodes"
            description="If enabled, accepted nodes will be highlighted in green."
          >
            <b-form-checkbox v-model="showAcceptedHighlight" switch>
              {{ showAcceptedHighlight ? "Enabled" : "Disabled" }}
            </b-form-checkbox>
          </b-form-group>
          <b-form-group
            label="Show child nodes of multi-content nodes"
            description="If enabled, child nodes of multi-content nodes will be shown to everyone. If disabled, chilld nodes of multi-content nodes will only be shown to users with edit permissions."
          >
            <b-form-checkbox v-model="showChildrenOfMulticontent" switch>
              {{ showChildrenOfMulticontent ? "Enabled" : "Disabled" }}
            </b-form-checkbox>
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
        <b-tab
          title="Advanced"
          :active="tab === 'advanced'"
          @click="$emit('change:tab', 'advanced')"
        >
          <b-form-group
            label="Show thumbnails"
            description="When disabled, node thumbnails will not be rendered on the screen. Turning this off may improve performance."
          >
            <b-form-checkbox v-model="renderImages" switch>
              {{ renderImages ? "Enabled" : "Disabled" }}
            </b-form-checkbox>
          </b-form-group>
          <b-form-group
            label="Geography map"
            :description="
              'Replace Tapestry with a map of Earth with placeholders for each node.' +
                (renderMap ? ' Set the default visible area below:' : '')
            "
          >
            <b-form-checkbox v-model="renderMap" switch data-qa="map-checkbox">
              {{ renderMap ? "Enabled" : "Disabled" }}
            </b-form-checkbox>
          </b-form-group>
          <b-form-group v-if="renderMap">
            <b-row>
              <b-col sm="4" offset-sm="4">
                <b-form-input
                  v-model="mapBounds.neLat"
                  placeholder="90"
                  :state="
                    latRangeValid && isValidLat(mapBounds.neLat) ? null : false
                  "
                />
                <b-form-text>Northern Latitudinal Bound</b-form-text>
              </b-col>
            </b-row>
            <b-row>
              <b-col sm="4">
                <b-form-input
                  v-model="mapBounds.swLng"
                  placeholder="-180"
                  :state="
                    lngRangeValid && isValidLng(mapBounds.swLng) ? null : false
                  "
                />
                <b-form-text>Western Longitudinal Bound</b-form-text>
              </b-col>
              <b-col sm="4" offset-sm="4">
                <b-form-input
                  v-model="mapBounds.neLng"
                  placeholder="180"
                  :state="
                    lngRangeValid && isValidLng(mapBounds.neLng) ? null : false
                  "
                />
                <b-form-text>Eastern Longitudinal Bound</b-form-text>
              </b-col>
            </b-row>
            <b-row>
              <b-col sm="4" offset-sm="4">
                <b-form-input
                  v-model="mapBounds.swLat"
                  placeholder="-90"
                  :state="
                    latRangeValid && isValidLat(mapBounds.swLat) ? null : false
                  "
                />
                <b-form-text>Southern Latitudinal Bound</b-form-text>
              </b-col>
            </b-row>
          </b-form-group>
          <b-form-group
            class="mt-4"
            label="Enable analytics"
            description="When enabled, analytics such as mouse clicks will be saved."
          >
            <b-form-checkbox v-model="analyticsEnabled" switch>
              {{ analyticsEnabled ? "Enabled" : "Disabled" }}
            </b-form-checkbox>
          </b-form-group>
        </b-tab>
        <b-tab
          title="Access"
          :active="tab === 'access'"
          @click="$emit('change:tab', 'access')"
        >
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
          <b-form-group
            label="Allow users to add draft nodes"
            description="When enabled, users will be able to add draft nodes that are only visible to 
              them to any node in the tapestry. These nodes will not be viewable by anyone else, 
              including administrators."
          >
            <b-form-checkbox
              v-model="draftNodesEnabled"
              switch
              :data-qa="`enable-draft`"
              @change="handleSubmitNodesEnabled"
            >
              {{ draftNodesEnabled ? "Enabled" : "Disabled" }}
            </b-form-checkbox>
          </b-form-group>
          <b-form-group
            v-if="draftNodesEnabled"
            label="Allow users to submit draft nodes"
            description="When enabled, users will be able to submit their nodes to administrators 
              for review. Administrators can add a submitted node to the main tapestry by accepting 
              the submission."
          >
            <b-form-checkbox
              v-model="submitNodesEnabled"
              :data-qa="`enable-submit-review`"
              switch
            >
              {{ submitNodesEnabled ? "Enabled" : "Disabled" }}
            </b-form-checkbox>
          </b-form-group>
          <b-form-group
            label="Allow moving all nodes"
            description="When enabled, users can move all nodes even if they don't have permission to move them. Note that this only allows them to move the nodes locally; the movement will not be saved unless the user has move permission for that node."
          >
            <b-form-checkbox v-model="allowMovingAllNodes" switch>
              {{ allowMovingAllNodes ? "Enabled" : "Disabled" }}
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
        data-qa="submit-button"
        size="sm"
        variant="primary"
        :disabled="fileUploading || !inputsValid"
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
import FileUpload from "./common/FileUpload"
import PermissionsTable from "./common/PermissionsTable"
import DragSelectModular from "@/utils/dragSelectModular"
import { data as wpData } from "@/services/wp"

const defaultPermissions = Object.fromEntries(
  [
    "public",
    "authenticated",
    ...Object.keys(wpData.roles).filter(
      role => role !== "editor" && role !== "administrator" && role !== "author"
    ),
  ].map(rowName => [rowName, ["read"]])
)

export default {
  name: "settings-modal",
  components: {
    FileUpload,
    PermissionsTable,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    tab: {
      type: String,
      required: false,
      default: "",
    },
    maxDepth: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      backgroundUrl: "",
      userId: "",
      showAccess: true,
      defaultPermissions,
      fileUploading: false,
      superuserOverridePermissions: true,
      showRejected: false,
      showAcceptedHighlight: true,
      showChildrenOfMulticontent: false,
      defaultDepth: 3,
      renderImages: true,
      analyticsEnabled: false,
      draftNodesEnabled: true,
      submitNodesEnabled: true,
      allowMovingAllNodes: false,
      renderMap: false,
      mapBounds: { neLat: 90, neLng: 180, swLat: -90, swLng: -180 },
    }
  },
  computed: {
    ...mapGetters(["tapestryJson"]),
    ...mapState(["settings", "rootId", "nodes", "apiError"]),
    latRangeValid() {
      return (
        this.getCoord(this.mapBounds.neLat, 90) >
        this.getCoord(this.mapBounds.swLat, -90)
      )
    },
    lngRangeValid() {
      return (
        this.getCoord(this.mapBounds.neLng, 180) >
        this.getCoord(this.mapBounds.swLng, -180)
      )
    },
    inputsValid() {
      if (this.renderMap) {
        return (
          this.latRangeValid &&
          this.isValidLat(this.mapBounds.swLat) &&
          this.isValidLat(this.mapBounds.neLat) &&
          this.lngRangeValid &&
          this.isValidLng(this.mapBounds.swLng) &&
          this.isValidLng(this.mapBounds.neLng)
        )
      }
      return true
    },
  },
  created() {
    if (this.settings.defaultPermissions) {
      this.defaultPermissions = this.settings.defaultPermissions
    }
  },
  mounted() {
    this.getSettings()
    this.$root.$on("bv::modal::show", (_, modalId) => {
      if (modalId === "settings-modal") {
        DragSelectModular.removeDragSelectListener()
      }
    })
    this.$root.$on("bv::modal::hide", (_, modalId) => {
      if (modalId === "settings-modal") {
        DragSelectModular.addDragSelectListener()
        this.$emit("close")
      }
    })
  },
  methods: {
    closeModal() {
      this.$emit("close")
    },
    getSettings() {
      const {
        backgroundUrl = "",
        autoLayout = false,
        defaultPermissions = this.defaultPermissions,
        showAccess = true,
        superuserOverridePermissions = true,
        showRejected = false,
        showAcceptedHighlight = true,
        showChildrenOfMulticontent = false,
        defaultDepth = 3,
        renderImages = true,
        renderMap = false,
        analyticsEnabled = false,
        draftNodesEnabled = true,
        submitNodesEnabled = true,
        allowMovingAllNodes = false,
        mapBounds = { neLat: 90, neLng: 180, swLat: -90, swLng: -180 },
      } = this.settings
      this.backgroundUrl = backgroundUrl
      this.autoLayout = autoLayout
      this.defaultPermissions = defaultPermissions
      this.showAccess = showAccess
      this.superuserOverridePermissions = superuserOverridePermissions
      this.showRejected = showRejected
      this.showAcceptedHighlight = showAcceptedHighlight
      this.showChildrenOfMulticontent = showChildrenOfMulticontent
      this.defaultDepth = defaultDepth
      this.renderImages = renderImages
      this.renderMap = renderMap
      this.analyticsEnabled = analyticsEnabled
      this.draftNodesEnabled = draftNodesEnabled
      this.submitNodesEnabled = submitNodesEnabled
      this.allowMovingAllNodes = allowMovingAllNodes
      this.mapBounds = mapBounds
    },
    async updateSettings() {
      const settings = Object.assign(this.settings, {
        backgroundUrl: this.backgroundUrl,
        autoLayout: this.autoLayout,
        defaultPermissions: this.defaultPermissions,
        showAccess: this.showAccess,
        superuserOverridePermissions: this.superuserOverridePermissions,
        showRejected: this.showRejected,
        showAcceptedHighlight: this.showAcceptedHighlight,
        showChildrenOfMulticontent: this.showChildrenOfMulticontent,
        defaultDepth: parseInt(this.defaultDepth),
        renderImages: this.renderImages,
        renderMap: this.renderMap,
        analyticsEnabled: this.analyticsEnabled,
        draftNodesEnabled: this.draftNodesEnabled,
        submitNodesEnabled: this.submitNodesEnabled,
        allowMovingAllNodes: this.allowMovingAllNodes,
        mapBounds: this.mapBounds,
      })
      await this.$store.dispatch("updateSettings", settings)
      this.closeModal()
    },
    isUploading(status) {
      this.fileUploading = status
    },
    isValidLat(coord) {
      return this.getCoord(coord, 0) <= 90 && this.getCoord(coord, 0) >= -90
    },
    isValidLng(coord) {
      return this.getCoord(coord, 0) <= 180 && this.getCoord(coord, 0) >= -180
    },
    getCoord(coord, coordIfEmpty) {
      return coord === "" ? coordIfEmpty : coord
    },
    handleSubmitNodesEnabled(event) {
      this.submitNodesEnabled = event
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
