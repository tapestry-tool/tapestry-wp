<template>
  <div>
    <loading v-show="loading" label="Loading form..." />
    <div
      v-show="!loading"
      ref="formContainer"
      @submit="handleSubmit"
      v-html="html"
    ></div>
  </div>
</template>

<script>
import axios from "axios"
import Loading from "@/components/Loading"
import GravityFormsApi from "@/services/GravityFormsApi"

export default {
  name: "gravity-form",
  components: {
    Loading,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      entry: null,
      html: "",
      loading: true,
    }
  },
  watch: {
    id(newId) {
      GravityFormsApi.getFormHtml(newId).then(html => (this.html = html))
    },
  },
  async mounted() {
    delete window[`gf_submitting_${this.id}`]

    const html = await GravityFormsApi.getFormHtml(this.id)
    this.html = html

    const entry = await GravityFormsApi.getFormEntry(this.id)
    this.entry = entry

    this.loading = false

    if (this.entry) {
      this.populateForm()
    }
  },
  methods: {
    handleSubmit(event) {
      // stop the original form event
      event.preventDefault()

      const form = this.$refs.formContainer.querySelector("form")
      const formId = form.getAttribute("id").split("gform_")[1]

      const data = new FormData(form)
      const url = form.action

      axios
        .post(url, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(response =>
          this.$emit("submit", {
            success: this.isSubmitSuccessful(response),
            response: response.data,
            formId,
          })
        )
    },
    isSubmitSuccessful(response) {
      return response.data.includes("gform_confirmation_message")
    },
    populateForm() {
      const BASE_INPUT_ID = "1"
      const inputs = Object.entries(this.entry).filter(entry =>
        entry[0].startsWith(BASE_INPUT_ID)
      )

      inputs.forEach(([id, value]) => {
        const inputName = `input_${id}`
        const inputElement = document.getElementsByName(inputName)[0]
        this.populateInput(inputElement, value)
      })
    },
    populateInput(input, value) {
      if (input.type === "text" || input.tagName.toLowerCase() === "textarea") {
        input.value = value
      } else if (input.type === "checkbox") {
        input.checked = input.value === value
      }
    },
  },
}
</script>
