<template>
  <div>
    <b-form-group label="Copyright/Licensing">
      <combobox
        v-model="node.license.type"
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
        v-if="node.license.type === licenseTypes.CUSTOM"
        label="License link"
        class="mt-3"
      >
        <b-form-input
          v-model="node.license.link"
          placeholder="Paste a link to your license starting with http:// or https://"
        ></b-form-input>
      </b-form-group>
      <b-form-group
        v-if="node.license.type === licenseTypes.CUSTOM"
        label="License description"
        class="mb-0"
      >
        <rich-text-form
          v-model="node.license.description"
          placeholder="Describe your license"
        ></rich-text-form>
      </b-form-group>
    </b-form-group>
    <b-form-group label="References">
      <rich-text-form
        id="node-references"
        v-model="node.references"
        data-testid="node-references"
        placeholder="Enter your references here"
      ></rich-text-form>
    </b-form-group>
  </div>
</template>

<script>
import Combobox from "@/components/Combobox"
import RichTextForm from "./content-form/RichTextForm"
import { licenses, licenseTypes } from "@/utils/constants"

export default {
  components: {
    Combobox,
    RichTextForm,
  },
  props: {
    node: {
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
    if (!this.node.license) {
      this.node.license = {
        ...this.licenses[0],
        link: "",
        description: "",
      }
    }
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
