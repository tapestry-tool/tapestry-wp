<template>
  <b-modal id="settings-modal" size="md" title="Update Settings">
    <b-container fluid class="px-0">
      <b-form-group label="Background url">
        <b-form-input
          id="background-url"
          placeholder="Enter background url"
          v-model="backgroundUrl"
          autofocus
          required
        />
      </b-form-group>
      <b-form-checkbox v-model="autolayout">Autolayout</b-form-checkbox>
    </b-container>
    <template slot="modal-footer">
      <b-button size="sm" variant="secondary" @click="closeModal">Cancel</b-button>
      <b-button size="sm" variant="primary" @click="updateSettings">Submit</b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'settings-modal',
  data() {
    return {
      currentSettings: {},
      backgroundUrl: '',
      autolayout: false
    }
  },
  props: {
    tapestryApiClient: {
      type: Object,
      required: true
    }
  },
  async mounted() {
    window.addEventListener("open-settings-modal", this.openModal);
    await this.getSettings();
  },
  beforeDestroy() {
    window.removeEventListener("open-settings-modal");
  },
  methods: {
    async openModal() {
      this.$bvModal.show("settings-modal");
    },
    closeModal() {
      this.$bvModal.hide("settings-modal");
    },
    async getSettings() {
      const response = await this.tapestryApiClient.getSettings();
      const { backgroundUrl = "", autolayout = false } = response;
      this.currentSettings = response;
      this.backgroundUrl = backgroundUrl;
      this.autolayout = autolayout;
    },
    async updateSettings() {
      const settings = Object.assign(this.currentSettings, { backgroundUrl: this.backgroundUrl, autolayout: this.autolayout });
      await this.tapestryApiClient.updateSettings(JSON.stringify(settings));
      this.$emit("settings-updated", settings);
      this.closeModal();
    }
  }
}
</script>

<style scoped>
</style>
