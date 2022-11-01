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
      <b-form-group>
        <b-form-checkbox v-model="autoResize" data-qa="auto-resize-toggle">
          Automatically set width and height
        </b-form-checkbox>
      </b-form-group>
      <b-form-row v-show="!autoResize">
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
import { mapGetters, mapState } from "vuex"
import { data } from "@/services/wp"

const idChars = "0123456789abcdefghijklmnopqrstuvwxyz"

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
      autoResize: true,
      copied: false,
    }
  },
  computed: {
    ...mapState(["settings"]),
    ...mapGetters(["getNodeDimensions"]),
    width() {
      return 800
    },
    height() {
      return 600
    },
    embed() {
      return `<iframe id="${this.iframeId}" width="${this.width}" height="${
        this.height
      }" style="border:solid 1px #93bbcf;border-radius:12px;" src="${
        this.settings.permalink
      }?iframe&no-sidebar"></iframe>${this.info}${
        this.autoResize ? this.autoResizeScript : ""
      }`
    },
    info() {
      return (
        `<div style="margin:-77px 0 0 -20px;">` +
        `<a title="Open this tapestry in a new window" ` +
        `href="${this.settings.permalink}" target="_blank">` +
        `<img width="40" height="40" src="${data.image_uri}/TapestryLogo.png" />` +
        `</a>` +
        `</div>`
      )
    },
    iframeId() {
      let randomId = ""
      for (let i = 0; i < 6; i++) {
        randomId += idChars[Math.floor(Math.random() * idChars.length)]
      }
      return `tpstry-${randomId}`
    },
    autoResizeScript() {
      const { x0, y0, x, y } = this.getNodeDimensions
      const nodeDiameter = 140
      // eslint-disable-next-line
      return `<script>(()=>{const r=${(y + nodeDiameter - y0) / (x + nodeDiameter - x0)},e=document.getElementById("${this.iframeId}");if(e){var parentDimensions=e.parentElement.getBoundingClientRect(),w=parentDimensions.width,h=w*r;e.setAttribute("width",w);e.setAttribute("height",h);}})();<\/script>`
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
  word-break: break-all;
  font-size: 0.8rem;
}
</style>
