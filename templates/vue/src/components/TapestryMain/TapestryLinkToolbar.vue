<template>
  <tapestry-context-toolbar
    :show="show && hasEditPermission"
    :position="position"
    :offset="10"
    @set-show="$emit('set-show', $event)"
  >
    <tapestry-toolbar-button
      id="delete-link-btn"
      horizontal
      tooltip="Delete Link"
      @click="handleDeleteLink"
    >
      <i class="fas fa-trash-alt fa-lg"></i>
    </tapestry-toolbar-button>

    <template v-if="isSameLevelLink">
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
    </template>
  </tapestry-context-toolbar>
</template>

<script>
import TapestryContextToolbar from "./TapestryContextToolbar"
import TapestryToolbarButton from "./common/TapestryToolbarButton"
import Helpers from "@/utils/Helpers"
import { mapActions, mapGetters, mapState } from "vuex"

export default {
  components: {
    TapestryContextToolbar,
    TapestryToolbarButton,
  },
  model: {
    prop: "show",
    event: "set-show",
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    link: {
      type: Object,
      required: false,
      default: null,
    },
    position: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState(["settings"]),
    ...mapGetters(["getNode"]),
    source() {
      return this.link ? this.getNode(this.link.source) : null
    },
    target() {
      return this.link ? this.getNode(this.link.target) : null
    },
    isSameLevelLink() {
      return this.link ? this.source.level === this.target.level : false
    },
    hasEditPermission() {
      return this.link
        ? Helpers.hasPermission(this.source, "add", this.settings.showRejected) &&
            Helpers.hasPermission(this.target, "add", this.settings.showRejected)
        : false
    },
  },
  methods: {
    ...mapActions(["deleteLink", "reverseLink"]),
    handleDeleteLink() {
      this.deleteLink({ source: this.source.id, target: this.target.id }).then(
        () => {
          this.$emit("set-show", false)
        }
      )
    },
    handleReverseLink() {
      this.reverseLink({ source: this.source.id, target: this.target.id })
      // the link prop is a reference to the link object in the store, so we don't need to emit an event to update it
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
