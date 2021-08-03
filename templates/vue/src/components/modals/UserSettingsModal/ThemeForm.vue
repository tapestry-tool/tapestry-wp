<template>
  <b-container>
    <b-form-group v-slot="{ ariaDescribedby }" label="Select Tapestry Theme">
      <b-form-radio-group
        id="theme-radio"
        v-model="userTheme"
        :options="options"
        :aria-describedby="ariaDescribedby"
        button-variant="outline-primary"
        size="lg"
        name="radio-btn-outline"
        buttons
      ></b-form-radio-group>
    </b-form-group>
  </b-container>
</template>

<script>
import { mapActions } from "vuex"
export default {
  name: "theme-form",
  components: {},
  props: {
    theme: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      userTheme: "",
      options: [
        { text: "Light Mode", value: "light" },
        { text: "Dark Mode", value: "dark" },
      ],
    }
  },
  computed: {},
  created() {
    this.userTheme = this.theme ? this.theme : "light"
    console.log(this.userTheme)
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

<style scoped>
.title {
  text-align: center;
}

.customizer {
  margin-top: 50px;
}
</style>
