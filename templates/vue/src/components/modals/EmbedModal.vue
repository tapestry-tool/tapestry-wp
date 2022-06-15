<template>
  <b-modal
    id="embed-modal"
    :visible="show"
    size="lg"
    title="Create Embed"
    body-class="p-0"
    @hidden="$emit('close')"
  >
    <b-container fluid class="pt-3">
      <b-form-row>
        <b-col>
          <b-form-group label="Width">
            <b-form-input v-model="width" type="number"></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label="Height">
            <b-form-input v-model="height" type="number"></b-form-input>
          </b-form-group>
        </b-col>
      </b-form-row>
      <b-form-group>
        <b-form-checkbox v-model="hideSidebar" data-qa="hide-sidebar-toggle">
          Hide sidebar
        </b-form-checkbox>
      </b-form-group>
      <b-form-group>
        <b-form-checkbox v-model="showInfo" data-qa="show-info-toggle">
          Show information below the iFrame
        </b-form-checkbox>
      </b-form-group>
      <b-form-group label="iFrame Code">
        <b-form-textarea
          ref="code"
          class="embed-code"
          data-qa="embed-code"
          readonly
          rows="2"
          max-rows="10"
          :value="embed"
          @focus="handleFocus"
        ></b-form-textarea>
      </b-form-group>
      <b-form-group>
        <b-button :variant="copied ? 'success' : 'primary'" @click="handleCopy">
          {{ copied ? "Copied" : "Copy" }} to clipboard
        </b-button>
      </b-form-group>
    </b-container>
    <template slot="modal-footer">
      <b-button
        data-qa="embed-close-button"
        size="sm"
        variant="primary"
        @click="$emit('close')"
      >
        Done
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapState } from "vuex"
import { data } from "@/services/wp"
export default {
  name: "embed-modal",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      width: 800,
      height: 600,
      showInfo: true,
      hideSidebar: true,
      copied: false,
    }
  },
  computed: {
    ...mapState(["settings"]),
    embed() {
      return `<iframe width="${this.width}" height="${
        this.height
      }" style="border: none;" src="${this.settings.permalink}?iframe${
        this.hideSidebar ? "&no-sidebar" : ""
      }"></iframe>${this.showInfo ? this.info : ""}`
    },
    info() {
      return `<div style="margin-top:10px;display:flex;align-items:center;gap:10px;"><img width="40" height="40" src="${data.image_uri}/TapestryLogo.png" /><b>${this.settings.title}</b> <a href="${this.settings.permalink}" target="_blank">Open this Tapestry</a></div>`
    },
  },
  methods: {
    handleFocus() {
      this.$refs.code.select()
    },
    handleCopy() {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.embed).then(
          () => {
            this.copySuccess()
          },
          () => {
            this.legacyCopy()
          }
        )
      } else {
        this.legacyCopy()
      }
    },
    legacyCopy() {
      this.$refs.code.select()
      if (document.execCommand("copy") === false) {
        alert(
          "Could not copy to clipboard. Please click the textarea to select, then manually copy and paste the code."
        )
      } else {
        this.copySuccess()
      }
    },
    copySuccess() {
      this.copied = true
      setTimeout(() => {
        this.copied = false
      }, 3000)
    },
  },
}
</script>

<style lang="scss" scoped>
.embed-code {
  font-family: monospace;
}
</style>
