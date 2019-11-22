<template>
  <div ref="formContainer" @submit="handleSubmit" v-html="form"></div>
</template>

<script>
import axios from "axios"

export default {
  name: "gravity-form",
  props: {
    id: {
      type: String,
      required: true,
    },
    form: {
      type: String,
      required: true,
    },
  },
  methods: {
    handleSubmit(event) {
      // stop the original form event
      event.preventDefault()

      const form = this.$refs.formContainer.querySelector("form")

      const data = new FormData(form)
      const url = form.action

      // TODO: Add loading screen

      axios
        .post(url, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(response =>
          this.$emit("submit", {
            id: this.id,
            success: this.isSubmitSuccessful(response),
            formData: data,
            response: response.data,
          })
        )
    },
    isSubmitSuccessful(response) {
      return response.data.includes("gform_confirmation_message")
    },
  },
}
</script>
