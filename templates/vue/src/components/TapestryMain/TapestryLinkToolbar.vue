<template>
  <tapestry-context-toolbar :target="linkElementId">
    <tapestry-toolbar-button
      :id="`delete-link-button-${source.id}-${target.id}`"
      horizontal
      tooltip="Delete Link"
      @click="handleDeleteLink"
    >
      <i class="fas fa-trash-alt fa-lg"></i>
    </tapestry-toolbar-button>

    <div class="tapestry-toolbar-separator"></div>

    <div class="vertex-title left">{{ source.title }}</div>
    <tapestry-toolbar-button
      :id="`reverse-link-button-${source.id}-${target.id}`"
      horizontal
      tooltip="Reverse Link"
      @click="handleReverseLink"
    >
      <i class="fas fa-exchange-alt fa-lg"></i>
    </tapestry-toolbar-button>
    <div class="vertex-title right">{{ target.title }}</div>
  </tapestry-context-toolbar>
</template>

<script>
import TapestryContextToolbar from "./TapestryContextToolbar"
import TapestryToolbarButton from "./common/TapestryToolbarButton"
import Helpers from "@/utils/Helpers"
import { tools } from "@/utils/constants"
import { mapActions } from "vuex"

export default {
  components: {
    TapestryContextToolbar,
    TapestryToolbarButton,
  },
  props: {
    source: {
      type: Object,
      required: true,
    },
    target: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      tools: tools,
    }
  },
  computed: {
    linkElementId() {
      return Helpers.getLinkElementId(this.source.id, this.target.id)
    },
  },
  methods: {
    ...mapActions(["deleteLink", "reverseLink"]),
    handleDeleteLink() {
      this.deleteLink({ source: this.source.id, target: this.target.id })
    },
    handleReverseLink() {
      const reversedElementId = Helpers.getLinkElementId(
        this.target.id,
        this.source.id
      )
      this.reverseLink({ source: this.source.id, target: this.target.id }).then(
        () => {
          console.log("reverse")
          this.$root.$emit("context-toolbar::open", reversedElementId)
        }
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.vertex-title {
  height: 52px;
  line-height: 52px;
  min-width: 52px;
  padding: 0 10px;
  color: #59595b;
  font-weight: bold;
  font-size: 1.1rem;

  &.left {
    text-align: right;
  }

  &.right {
    text-align: left;
  }
}
</style>
