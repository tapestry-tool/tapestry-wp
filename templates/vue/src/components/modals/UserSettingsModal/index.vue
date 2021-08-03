<template>
  <b-modal
    id="user-settings-modal"
    data-qa="user-settings-modal"
    :visible="show"
    size="lg"
    title="User Settings"
    scrollable
    body-class="p-0"
    @hidden="$emit('close')"
  >
    <b-container fluid class="px-0">
      <b-tabs card>
        <b-tab
          title="Theme"
          :active="tab === 'theme'"
          @click="$emit('change:tab', 'theme')"
        ></b-tab>
        <theme-form ref="ThemeForm" :theme="theme"></theme-form>
      </b-tabs>
    </b-container>
    <template slot="modal-footer">
      <b-button size="sm" variant="secondary" @click="closeModal">
        Cancel
      </b-button>
      <b-button
        id="save-button"
        data-qa="theme-submit-button"
        size="sm"
        variant="primary"
        @click="saveTheme"
      >
        Save theme
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import DragSelectModular from "@/utils/dragSelectModular"
import ThemeForm from "./ThemeForm"
import { mapState } from "vuex"
export default {
  name: "user-settings-modal",
  components: {
    ThemeForm,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    tab: {
      type: String,
      required: false,
      default: "",
    },
  },
  computed: {
    ...mapState(["theme"]),
  },
  mounted() {
    this.$root.$on("bv::modal::show", (_, modalId) => {
      if (modalId === "user-settings-modal") {
        DragSelectModular.removeDragSelectListener()
      }
    })
    this.$root.$on("bv::modal::hide", (_, modalId) => {
      if (modalId === "user-settings-modal") {
        DragSelectModular.addDragSelectListener()
        this.$emit("close")
      }
    })
  },
  methods: {
    closeModal() {
      this.$emit("close")
    },
    saveTheme() {
      this.$refs.ThemeForm.saveTheme()
      this.$emit("close")
    },
  },
}
</script>

<style lang="scss" scoped>
#save-button {
  position: relative;
  &:disabled {
    pointer-events: none;
    cursor: not-allowed;
  }
  > span {
    position: absolute;
    height: 1.5em;
    width: 1.5em;
    left: 33%;
  }
}
</style>
