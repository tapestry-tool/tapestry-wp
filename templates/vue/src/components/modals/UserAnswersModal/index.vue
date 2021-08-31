<template>
  <b-modal
    id="user-answers-modal"
    data-qa="user-answers-modal"
    :visible="show"
    size="xl"
    title="User Answers"
    scrollable
    body-class="p-0"
    @hidden="$emit('close')"
  >
    <b-container fluid class="px-0">
      <b-tabs card>
        <b-tab
          title="Answers"
          :active="tab === 'answers'"
          @click="$emit('change:tab', 'answers')"
        ></b-tab>
        <user-answers-form />
      </b-tabs>
    </b-container>
    <template slot="modal-footer">
      <b-button size="sm" variant="secondary" @click="closeModal">
        Cancel
      </b-button>
      <b-button>
        Random Button
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import DragSelectModular from "@/utils/dragSelectModular"
import UserAnswersForm from "./UserAnswersForm"
export default {
  name: "user-answers-modal",
  components: {
    UserAnswersForm,
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
    this.$root.$on("bv::modal::show", (_, modalId) => {
      if (modalId === "user-answers-modal") {
        DragSelectModular.removeDragSelectListener()
      }
    })
    this.$root.$on("bv::modal::hide", (_, modalId) => {
      if (modalId === "user-answers-modal") {
        DragSelectModular.addDragSelectListener()
        this.$emit("close")
      }
    })
  },
  methods: {
    closeModal() {
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
