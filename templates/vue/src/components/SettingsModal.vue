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
        <b-tab title="Advanced">
          <b-button @click="exportTapestry">Export Tapestry</b-button>
          <b-button @click="duplicateTapestry">Duplicate Tapestry</b-button>
          <div v-if="showDuplicateConfirmation">
            <p>Your new Tapestry is ready! Click on the link below to view it.</p>
            <a :href="duplicateLink" target="_blank">{{ duplicateLink }}</a>
          </div>
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
import TapestryApi from "@/services/TapestryAPI"
import FileUpload from "./FileUpload"

const client = new TapestryApi(wpPostId)

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
      showDuplicateConfirmation: false,
      duplicateLink: null,
    }
  },
  computed: {
    ...mapGetters(["settings", "tapestryJson"]),
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
      } = this.settings
      this.backgroundUrl = backgroundUrl
      this.autoLayout = autoLayout
      this.nodeDraggable = nodeDraggable
    },
    async updateSettings() {
      const settings = Object.assign(this.settings, {
        backgroundUrl: this.backgroundUrl,
        autoLayout: this.autoLayout,
        nodeDraggable: this.nodeDraggable,
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
    duplicateTapestry() {
      const tapestry = this.tapestryJson
      client.addTapestry({ title: this.settings.title, ...tapestry }).then(res => {
        const href = `${location.origin}/tapestry/${res.settings.tapestrySlug}`
        this.duplicateLink = href
        this.showDuplicateConfirmation = true
      })
    },
  },
}
</script>

<style lang="scss" scoped></style>
