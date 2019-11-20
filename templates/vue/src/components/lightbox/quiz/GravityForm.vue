<template>
  <div ref="formContainer" @submit="handleSubmit" v-html="form"></div>
</template>

<script>
import axios from "axios"

export default {
  name: "gravity-form",
  props: {
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

      axios
        .post(url, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(res => console.log(res))
    },
  },
}
</script>
