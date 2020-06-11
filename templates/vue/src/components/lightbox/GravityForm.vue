<template>
  <div :class="['gf-container', { 'read-only': readOnly }]">
    <loading v-show="loading" label="Loading form..." />
    <div v-if="!loading && readOnly">
      <tapestry-activity
        v-if="answer"
        :type="answer.type"
        :entry="answer.entry"
      ></tapestry-activity>
      <p v-else>You haven't completed this activity yet.</p>
    </div>
    <div
      v-show="!loading && !readOnly"
      ref="formContainer"
      class="gf-form-container"
      @submit="handleSubmit"
      v-html="html"
    ></div>
  </div>
</template>

<script>
import axios from "axios"
import Loading from "@/components/Loading"
import TapestryActivity from "@/components/TapestryActivity"
import GravityFormsApi from "@/services/GravityFormsApi"

export default {
  name: "gravity-form",
  components: {
    Loading,
    TapestryActivity,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
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
  data() {
    return {
      entry: null,
      html: "",
      loading: true,
    }
  },
  computed: {
    answer() {
      if (this.entry) {
        const answers = Object.entries(this.entry)
          .filter(obj => !isNaN(parseInt(obj[0], 10)))
          .map(i => i[1])
        return answers.length === 1
          ? {
              type: "text",
              entry: answers[0],
            }
          : { type: "checklist", entry: answers.filter(answer => answer !== "") }
      }
      return null
    },
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

    const entry = await GravityFormsApi.getFormEntry(this.id, wpData.wpTeenId || 0)
    this.entry = entry

    this.loading = false
    this.$emit("load")

    this.disableAutocomplete()
    this.styleImageUI()
    this.addInputListeners()

    if (this.entry) {
      this.populateForm()
    }

    if (wpData.wpTeenId) {
      this.disableSubmit()
      this.addNotAllowedText()
    }
  },
  methods: {
    addInputListeners() {
      const form = this.$refs.formContainer.querySelector("form")

      const textareas = form.querySelectorAll("textarea")
      textareas.forEach(textarea => {
        const events = ["focus", "blur"]
        events.forEach(event =>
          textarea.addEventListener(event, () =>
            globals.recordAnalyticsEvent("user", event, "gf-textarea", this.id)
          )
        )
      })

      const inputs = form.querySelectorAll("input")
      inputs.forEach(input => {
        if (input.type === "text") {
          const events = ["focus", "blur"]
          events.forEach(event =>
            input.addEventListener(event, () =>
              globals.recordAnalyticsEvent("user", event, "gf-input", this.id)
            )
          )
        } else {
          input.addEventListener("input", () => {
            globals.recordAnalyticsEvent(
              "user",
              "input",
              `gf-${input.type}`,
              this.id
            )
          })
        }
      })
    },
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
        .then(response => {
          if (!this.isSubmitSuccessful(response)) {
            delete window[`gf_submitting_${this.id}`]
            this.html = response.data
          } else {
            globals.recordAnalyticsEvent("user", "submit", "gf", this.id)
            this.$emit("submit")
          }
        })
    },
    isSubmitSuccessful(response) {
      return response.data.includes("gform_confirmation_message")
    },
    populateForm() {
      const inputs = Object.entries(this.entry).filter(
        entry => !isNaN(parseInt(entry[0]))
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
    // Disables autocomplete of GravityForms by targetting generated ids
    disableAutocomplete() {
      const allInputs = document.getElementsByTagName("input")
      // Use splice to convert HTMLCollection to Array per: https://stackoverflow.com/a/222847
      const formInputs = Array.from(allInputs).filter(input =>
        // All GravityForm inputs are enumerated with the input_ prefix
        input.id.startsWith("input_")
      )

      formInputs.forEach(input => {
        // Manually sets autocomplete flag for each element of form
        input.autocomplete = "off"
      })
    },
    disableSubmit() {
      const form = this.$refs.formContainer.querySelector("form")
      const submitButton = form.querySelector("[type=submit]")
      submitButton.disabled = true
      submitButton.classList.add("gf-submit-disabled")
    },
    addNotAllowedText() {
      const form = this.$refs.formContainer.querySelector("form")
      const footer = form.querySelector(".gform_footer")
      footer.appendChild(
        document.createTextNode(`You're not allowed to modify teen-only activities.`)
      )
    },
    styleImageUI() {
      const imageContainer = document.querySelector(".gfield_checkbox")
      if (imageContainer) {
        const allImages = imageContainer.childNodes
        const allImagesArray = Array.from(allImages)
        allImagesArray.forEach(image => {
          image.childNodes[1].addEventListener("click", function() {
            this.parentElement.classList.toggle("image-choices-choice-selected")
          })
          image.childNodes[1].addEventListener("focus", function() {
            this.parentElement.classList.add("image-choices-choice-focus")
          })
          image.childNodes[1].addEventListener("blur", function() {
            this.parentElement.classList.remove("image-choices-choice-focus")
          })
          image.addEventListener("mouseover", function() {
            this.classList.add("image-choices-choice-hover")
          })
          image.addEventListener("mouseout", function() {
            this.classList.remove("image-choices-choice-hover")
          })
          image.classList.add("image-choices-choice")
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.gf-container {
  width: 100%;
  height: 100%;
}

.gf-form-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<style lang="scss">
.gf-container {
  width: 100%;
  padding-left: 20%;
  float: right;
  font-size: 1.4em;
}

.read-only {
  padding: 3em;
  float: none;
  margin: auto;
  color: black;
}

.gform_footer {
  display: flex;
  flex-direction: column;
}

.gform_wrapper .image-choices-use-images .ginput_container {
  .gfield_checkbox {
    display: flex;
    align-items: flex-start;

    > li {
      flex: 0 0 18%;
      display: flex;

      &:nth-last-child(-n + 4):first-child,
      &:nth-last-child(-n + 4):first-child ~ li {
        flex-grow: 1;
      }

      .image-choices-field .image-choices-choice-image-wrap {
        padding-bottom: 0 !important;
      }
    }
  }
}

.gf-submit-disabled {
  opacity: 0.7;
  cursor: not-allowed !important;
  margin-bottom: 1rem !important;
}
</style>
