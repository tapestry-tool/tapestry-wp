<template>
  <b-form-group v-slot="{ ariaDescribedby }" label="Select your theme">
    <b-form-radio-group
      id="theme-radio"
      v-model="userTheme"
      :options="options"
      :aria-describedby="ariaDescribedby"
      button-variant="outline-dark"
      data-qa="theme-settings"
      name="radio-btn-outline"
      buttons
    ></b-form-radio-group>
  </b-form-group>
</template>

<script>
import { mapActions, mapState } from "vuex"

export default {
  name: "theme-form",
  components: {},
  data() {
    return {
      userTheme: "",
      options: [
        { text: "Light Mode", value: "light" },
        { text: "Dark Mode", value: "dark" },
        { text: "System", value: "system" },
      ],
    }
  },
  computed: {
    ...mapState(["theme"]),
  },
  created() {
    this.userTheme = this.theme ? this.theme : "light"
  },
  methods: {
    ...mapActions(["updateUserSettings"]),
    saveTheme() {
      this.updateUserSettings({
        theme: this.userTheme,
      })
      document.documentElement.setAttribute("data-theme", this.userTheme)
    },
  },
}
</script>
