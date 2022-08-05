<template>
  <tapestry-context-toolbar :target="linkElementId">
    <tapestry-toolbar-button
      :id="`reverse-link-button-${source.id}-${target.id}`"
      horizontal
      icon="cog"
      tooltip="Reverse Link"
    />
    <tapestry-toolbar-button
      :id="`delete-link-button-${source.id}-${target.id}`"
      horizontal
      icon="cog"
      tooltip="Delete Link"
    />
  </tapestry-context-toolbar>
</template>

<script>
import TapestryContextToolbar from "./TapestryContextToolbar"
import TapestryToolbarButton from "./common/TapestryToolbarButton"
import Helpers from "@/utils/Helpers"
import { tools } from "@/utils/constants"

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
}
// TODO: make sure separators still work
</script>
