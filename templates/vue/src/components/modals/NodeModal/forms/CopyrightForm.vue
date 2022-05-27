<template>
  <div>
    <b-form-group label="Copyright/Licensing">
      <combobox
        :value="license.type"
        @input="inputProperty('type', $event)"
        item-text="name"
        item-value="type"
        :options="licenses"
        placeholder="Please select a license"
        class="combobox mb-0"
      >
        <template v-slot="{ option }">
          <div class="license-option">
            <span>{{ option.name }}</span>
            <span>
              <i v-for="icon in option.icons" :key="icon" :class="icon"></i>
            </span>
          </div>
        </template>
      </combobox>
      <b-form-group
        v-if="license.type === licenseTypes.CUSTOM"
        label="License link"
        class="mt-3"
      >
        <b-form-input
          :value="license.link"
          @input="inputProperty('link', $event)"
          placeholder="Paste a link to your license starting with http:// or https://"
        ></b-form-input>
      </b-form-group>
      <b-form-group
        v-if="license.type === licenseTypes.CUSTOM"
        label="License description"
        class="mb-0"
      >
        <rich-text-form
          :value="license.description"
          @input="inputProperty('description', $event)"
          placeholder="Describe your license"
        ></rich-text-form>
      </b-form-group>
    </b-form-group>
  </div>
</template>

<script>
import Combobox from "@/components/modals/common/Combobox"
import RichTextForm from "./ContentForm/RichTextForm"
import { licenses, licenseTypes } from "@/utils/constants"

export default {
  components: {
    Combobox,
    RichTextForm,
  },
  model: {
    prop: "license",
    event: "input",
  },
  props: {
    license: {
      type: Object,
      required: true,
    },
  },
  computed: {
    licenseTypes() {
      return licenseTypes
    },
    licenses() {
      return Object.entries(licenses).map(([type, license]) => ({
        ...license,
        type,
      }))
    },
  },
  mounted() {
    if (!this.license) {
      this.input({
        ...this.licenses[0],
        link: "",
        description: "",
      })
    }
  },
  methods: {
    input(value) {
      this.$emit("input", value)
    },
    inputProperty(property, value) {
      this.input({
        ...this.license,
        [property]: value,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.combobox {
  margin-bottom: 1em;
}

.license-option {
  display: flex;
  justify-content: space-between;
  width: 100%;

  i {
    font-size: 1.2em;
    margin-right: 4px;
    opacity: 0.8;

    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
