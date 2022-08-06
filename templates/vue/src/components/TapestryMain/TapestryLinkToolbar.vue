<template>
  <tapestry-context-toolbar :target="linkElementId">
    <tapestry-toolbar-button
      :id="`reverse-link-button-${source.id}-${target.id}`"
      horizontal
      tooltip="Reverse Link"
    >
      <i class="fas fa-exchange-alt fa-lg"></i>
    </tapestry-toolbar-button>
    <tapestry-toolbar-button
      :id="`delete-link-button-${source.id}-${target.id}`"
      horizontal
      tooltip="Delete Link"
    >
      <i class="fas fa-trash-alt fa-lg"></i>
    </tapestry-toolbar-button>
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
</script>
