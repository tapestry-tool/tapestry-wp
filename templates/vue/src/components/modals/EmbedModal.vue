<template>
  <b-modal
    id="embed-modal"
    :visible="show"
    size="lg"
    title="Create Embed"
    body-class="p-0"
    hide-footer
    @hidden="$emit('close')"
  >
    <b-container fluid class="pt-3">
      <b-form-group>
        <b-form-checkbox v-model="showOpenLink" data-qa="show-info-toggle">
          Include a link to open the Tapestry in a new window
        </b-form-checkbox>
      </b-form-group>
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
      <b-form-group label="Embed Code">
        <b-form-textarea
          ref="code"
          class="embed-code"
          data-qa="embed-code"
          readonly
          rows="2"
          max-rows="10"
          :value="embedCode"
          @focus="handleFocus"
        ></b-form-textarea>
      </b-form-group>
      <b-form-group>
        <b-button :variant="copied ? 'success' : 'primary'" @click="handleCopy">
          {{ copied ? "Copied" : "Copy" }} to clipboard
        </b-button>
      </b-form-group>
      <b-form-group ref="ref2" label="Preview">
        <div ref="preview">
          <iframe
            :width="autoResize ? '100%' : width"
            :height="autoResize && autoHeight ? autoHeight : height"
            :style="iframeStyle"
            :src="
              settings.permalink +
                '?iframe' +
                (showOpenLink ? '&show-open-link' : '')
            "
          ></iframe>
        </div>
      </b-form-group>
    </b-container>
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
      width: 800,
      height: 600,
      showOpenLink: true,
      autoResize: true,
      autoHeight: 0,
      copied: false,
    }
  },
  computed: {
    ...mapState(["settings"]),
    ...mapGetters(["getNodeDimensions"]),
    embedCode() {
      return `${this.iframeCode}${this.autoResize ? this.autoResizeScript : ""}`
    },
    iframeCode() {
      return `<iframe id="${this.iframeId}" width="${this.width}" height="${
        this.height
      }" style="${this.iframeStyle}" src="${this.settings.permalink}?iframe${
        this.showOpenLink ? "&show-open-link" : ""
      }" onLoad="setTimeout(f${this.iframeId}, 1000);"></iframe>`
    },
    iframeStyle() {
      return "border:solid 1px #a8aaad;border-radius:12px;max-width:100% !important"
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
      // Shortened vars:
      // - r: Ratio of tapestry height to width
      // - e: The iframe element
      // eslint-disable-next-line
      return `<script>f${this.iframeId}=()=>{const e=document.getElementById("${this.iframeId}"),r=(e.contentWindow.document.body.offsetHeight+800)/(e.contentWindow.document.body.offsetWidth+800);if(e){e.setAttribute("width","100%");var w=e.getBoundingClientRect().width;e.setAttribute("height",w*r)}};window.addEventListener("resize",f${this.iframeId});<\/script>`
    },
  },
  mounted() {
    setTimeout(() => {
      this.resizePreview()
    })
  },
  created() {
    window.addEventListener("resize", this.resizePreview)
  },
  destroyed() {
    window.removeEventListener("resize", this.resizePreview)
  },
  methods: {
    handleFocus() {
      this.$refs.code.select()
    },
    handleCopy() {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.embedCode).then(
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
    resizePreview() {
      const { x0, y0, x, y } = this.getNodeDimensions
      const tapestryRatio = (y - y0 + 800) / (x - x0 + 800)
      this.autoHeight = this.$refs.preview?.clientWidth * tapestryRatio
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
