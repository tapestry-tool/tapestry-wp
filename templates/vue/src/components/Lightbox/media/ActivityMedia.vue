<template>
  <activity-screen
    :id="node.id"
    :read-only="readOnly"
    style="position: relative;"
    @submit="handleSubmit"
    @back="$emit('close')"
    @close="$emit('close')"
  />
</template>

<script>
import { mapActions } from "vuex"
import ActivityScreen from "./common/ActivityScreen"
import Helpers from "@/utils/Helpers"

export default {
  name: "activity-media",
  components: {
    ActivityScreen,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    readOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  mounted() {
    this.$emit("load")
  },
  methods: {
    ...mapActions(["updateNodeProgress"]),
    handleSubmit() {
      if (Helpers.canUserUpdateProgress(this.node) && !this.readOnly) {
        const numberCompleted = this.node.quiz.filter(question => question.completed)
          .length
        const progress = numberCompleted / this.node.quiz.length
        this.updateNodeProgress({ id: this.node.id, progress }).then(() => {
          if (progress === 1) {
            this.$emit("complete")
          }
        })
      }
    },
  },
}
</script>
