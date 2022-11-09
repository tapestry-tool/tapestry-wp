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
      }" style="border:solid 1px #a8aaad;border-radius:12px;max-width:100% !important" src="${
        this.settings.permalink
      }?iframe" onLoad="setTimeout(f${this.iframeId}, 1000);"></iframe>${
        this.autoResize ? this.autoResizeScript : ""
      }`
    },
    iframeId() {
      let randomId = ""
      const idChars = "0123456789abcdefghijklmnopqrstuvwxyz"
      for (let i = 0; i < 6; i++) {
        randomId += idChars[Math.floor(Math.random() * idChars.length)]
      }
      return `tpstry${randomId}`
    },
    autoResizeScript() {
      const nodeDiameter = 350
      // Shortened vars:
      // - r: Ratio of tapestry height to width
      // - e: The iframe element
      // eslint-disable-next-line
      return `<script>f${this.iframeId}=()=>{const e=document.getElementById("${this.iframeId}"),r=(e.contentWindow.document.body.offsetHeight+${nodeDiameter}*2)/(e.contentWindow.document.body.offsetWidth+${nodeDiameter}*2);if(e){e.setAttribute("width","100%");var w=e.getBoundingClientRect().width;e.setAttribute("height",w*r)}};window.addEventListener("resize",f${this.iframeId});<\/script>`
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
