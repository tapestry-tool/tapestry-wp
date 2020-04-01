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
          <div v-for="(activity, index) in profileActivities" :key="index">
            <b-row align-v="center" class="mb-2 mx-0">
              <b-button
                class="ml-auto"
                size="sm"
                variant="outline-danger"
                @click="deleteActivity(index)"
              >
                Delete
              </b-button>
            </b-row>
            <b-form-group label="Choose an activity">
              <combobox
                v-model="activity.activityRef"
                :options="activities"
                item-text="text"
                item-value="id"
                empty-message="There are no activities yet."
              >
                <template v-slot="slotProps">
                  <p>
                    {{ slotProps.option.text }}
                  </p>
                </template>
              </combobox>
            </b-form-group>
          </div>
          <b-row class="mx-0">
            <b-button variant="primary" @click="addActivity">
              <i class="fas fa-plus icon"></i>
              Add Activity
            </b-button>
          </b-row>
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

export default {
  name: "settings-modal",
  components: {
    FileUpload,
    Combobox,
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
      spaceshipBackgroundUrl: "",
      profileActivities: [],
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
    getSettings() {
      const {
        backgroundUrl = "",
        autoLayout = false,
        nodeDraggable = true,
        spaceshipBackgroundUrl = "",
        profileActivities = [],
      } = this.settings
      this.backgroundUrl = backgroundUrl
      this.autoLayout = autoLayout
      this.nodeDraggable = nodeDraggable
      this.spaceshipBackgroundUrl = spaceshipBackgroundUrl
      this.profileActivities = profileActivities
    },
    async updateSettings() {
      const settings = Object.assign(this.settings, {
        backgroundUrl: this.backgroundUrl,
        autoLayout: this.autoLayout,
        nodeDraggable: this.nodeDraggable,
        spaceshipBackgroundUrl: this.spaceshipBackgroundUrl,
        profileActivities: this.profileActivities,
      })
      await this.$store.dispatch("updateSettings", settings)
      // TODO: Improve behavior so refresh is not required (currently auto-layout and setting the background image only happen initially)
      // this.$emit("settings-updated", settings);
      // this.closeModal();
      location.reload()
    },
  },
}
</script>

<style lang="scss" scoped></style>
