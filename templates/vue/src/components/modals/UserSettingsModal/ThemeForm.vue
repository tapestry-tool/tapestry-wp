<template>
  <b-container>
    <b-form-group v-slot="{ ariaDescribedby }" label="Select Tapestry Theme">
      <b-form-radio
        v-model="theme"
        :aria-describedby="ariaDescribedby"
        value="Light"
        switch
      >
        Light Mode
      </b-form-radio>
      <b-form-radio
        v-model="theme"
        :aria-describedby="ariaDescribedby"
        value="Dark"
        switch
      >
        Dark Mode B
      </b-form-radio>
    </b-form-group>
  </b-container>
</template>

<script>
import { mapActions } from "vuex"
export default {
  name: "avatar-form",
  components: {},
  props: {},
  data() {
    return { theme: "" }
  },
  computed: {
    hasTheme() {
      return null
    },
  },
  created() {},
  methods: {
    ...mapActions(["updateUserSettings"]),
    saveTheme() {
      this.updateUserSettings({ theme: this.userTheme })
    },
  },
}
</script>

<style scoped>
.title {
  text-align: center;
}

.customizer {
  margin-top: 50px;
}
</style>
