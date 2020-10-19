<template>
  <div></div>
</template>

<script>
import {mapState } from "vuex";
export default {
  name: "tapestry-error",
  computed: {
    ...mapState(["tapestryError"]),
    hasError() {
      return this.tapestryError
    }
  },
  watch: {
    hasError() {
      console.log("watch");
      if (this.tapestryError) {
        this.makeToast("Error", this.tapestryError.error);
      }
    }
  },
  methods: {
    makeToast(title, message) {
      this.$bvToast.toast(message, {
        title: title
      });
    },
  }
};
</script>

<style lang="scss">
#b-toaster-top-right {
  top: 50px
}
</style>    