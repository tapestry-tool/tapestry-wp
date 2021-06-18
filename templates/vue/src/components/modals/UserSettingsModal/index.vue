<template>
  <b-modal
    id="settings-modal"
    data-qa="settings-modal"
    :visible="show"
    size="lg"
    title="Tapestry Settings"
    scrollable
    body-class="p-0"
    @hidden="$emit('close')"
  >
    <b-container fluid class="px-0">
      <b-tabs card>
        <b-tab
          title="Appearance"
          :active="tab === 'appearance'"
          @click="$emit('change:tab', 'appearance')"
        ></b-tab>
        <avatar-form></avatar-form>
      </b-tabs>
    </b-container>
    <template slot="modal-footer">
      <b-button size="sm" variant="secondary" @click="closeModal">
        Cancel
      </b-button>
      <b-button
        id="save-button"
        data-qa="submit-button"
        size="sm"
        variant="primary"
        :disabled="fileUploading || !inputsValid"
        @click="updateSettings"
      >
        <b-spinner v-if="fileUploading"></b-spinner>
        <div :style="!fileUploading ? '' : 'opacity: 50%;'">Submit</div>
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapActions } from "vuex"
import DragSelectModular from "@/utils/dragSelectModular"
import AvatarForm from "./AvatarForm"

export default {
  name: "user-settings-modal",
  components: {
    AvatarForm,
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
  mounted() {
    this.getSettings()
    this.$root.$on("bv::modal::show", (_, modalId) => {
      if (modalId === "settings-modal") {
        DragSelectModular.removeDragSelectListener()
      }
    })
    this.$root.$on("bv::modal::hide", (_, modalId) => {
      if (modalId === "settings-modal") {
        DragSelectModular.addDragSelectListener()
        this.$emit("close")
      }
    })
  },
  methods: {
    ...mapActions(["getTapestryExport"]),
    closeModal() {
      this.$emit("close")
    },
  },
}
</script>

<style lang="scss" scoped>
.depth-slider {
  border: none;
  padding: 0;
  max-width: 350px;
}

.depth-slider-description {
  color: #6c757d;
  font-size: 80%;
}

.spinner {
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

#export-button {
  position: relative;
  > span {
    position: absolute;
    height: 1.5em;
    width: 1.5em;
  }
  &.disabled {
    pointer-events: none;
    cursor: not-allowed;
  }
}

#optimize-thumbnails-button {
  position: relative;
  > span {
    position: absolute;
    height: 1.5em;
    width: 1.5em;
  }
  &.disabled {
    pointer-events: none;
    cursor: not-allowed;
  }
}

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
