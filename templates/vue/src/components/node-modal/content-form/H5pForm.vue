<template>
  <div>
    <b-form-group label="H5P Content">
      <combobox
        v-model="selectedId"
        item-text="title"
        item-value="id"
        empty-message="There's no H5P content yet. Please add one in your WP dashboard."
        :options="options"
      >
        <template v-slot="{ option }">
          <p>
            <code>{{ option.id }}</code>
            {{ option.title }}
          </p>
        </template>
      </combobox>
    </b-form-group>
    <iframe
      ref="frame"
      class="duration-calculator"
      :src="mediaUrl"
      @load="handleLoad"
    ></iframe>
  </div>
</template>

<script>
import Combobox from "@/components/Combobox"
import H5PApi from "@/services/H5PApi"

export default {
  components: {
    Combobox,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      selectedId: null,
      options: [],
    }
  },
  computed: {
    mediaUrl() {
      return `${wpData.adminAjaxUrl}?action=h5p_embed&id=${this.selectedId}`
    },
  },
  watch: {
    mediaUrl(val) {
      this.node.typeData.mediaURL = val
    },
  },
  mounted() {
    H5PApi.getAllContent().then(options => {
      this.options = options
      const defaultValue = options.find(content => {
        const id = this.node.typeData.mediaURL.split("&id=")[1]
        return content.id == id
      })
      if (defaultValue) {
        this.selectedId = defaultValue.id
      }
    })
  },
  methods: {
    handleLoad() {
      const h5p = this.$refs.frame.contentWindow.H5P
      if (h5p) {
        const instance = h5p.instances[0]
        const libraryName = instance.libraryInfo.machineName
        if (libraryName === "H5P.InteractiveVideo") {
          const h5pVideo = instance.video
          const handleH5PLoad = () => {
            this.node.mediaDuration = parseInt(h5pVideo.getDuration())
            this.$emit("load")
          }
          if (h5pVideo.getDuration() !== undefined) {
            handleH5PLoad()
          } else {
            h5pVideo.on("loaded", handleH5PLoad)
          }
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.duration-calculator {
  position: fixed;
  left: 101vw;
  width: 1px;
}
</style>
