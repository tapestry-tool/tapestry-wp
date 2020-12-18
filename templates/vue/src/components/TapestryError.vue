<template>
  <div></div>
</template>

<script>
import { mapState } from "vuex"
export default {
  name: "tapestry-error",
  computed: {
    ...mapState(["apiError", "displayErrors"]),
    hasError() {
      return this.apiError
    },
    shouldShowErrors() {
      return this.displayErrors
    },
  },
  watch: {
    hasError() {
      if (this.apiError && this.shouldShowErrors) {
        this.makeToast("Error", this.apiError.error, "danger")
      }
    },
  },
  methods: {
    makeToast(title, message, variant) {
      this.$bvToast.toast(message, {
        title: title,
        variant: variant,
      })
    },
  },
}
</script>

<style lang="scss">
#b-toaster-top-right {
  top: 50px;
}
</style>
