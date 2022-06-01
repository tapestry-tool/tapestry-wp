<template>
  <div v-if="license">
    <b-form-group label="Copyright/Licensing">
      <combobox
        :value="license.type"
        item-text="name"
        item-value="type"
        :options="licenses"
        placeholder="Please select a license"
        class="combobox mb-0"
        @input="update('license.type', $event)"
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
          placeholder="Paste a link to your license starting with http:// or https://"
          @input="update('license.link', $event)"
        ></b-form-input>
      </b-form-group>
      <b-form-group
        v-if="license.type === licenseTypes.CUSTOM"
        label="License description"
        class="mb-0"
      >
        <rich-text-form
          :value="license.description"
          placeholder="Describe your license"
          @input="update('license.description', $event)"
        ></rich-text-form>
      </b-form-group>
    </b-form-group>
  </div>
</template>

<script>
import Combobox from "@/components/modals/common/Combobox"
import RichTextForm from "./ContentForm/RichTextForm"
import { licenses, licenseTypes } from "@/utils/constants"
import { mapMutations, mapState } from "vuex"

export default {
  components: {
    Combobox,
    RichTextForm,
  },
  computed: {
    ...mapState({
      license: state => state.currentEditingNode.license,
    }),
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
  watch: {
    license: {
      handler(license) {
        if (!license) {
          this.update("license", {
            ...this.licenses[0],
            link: "",
            description: "",
          })
        }
      },
      immediate: true,
    },
  },
  methods: {
    ...mapMutations(["setCurrentEditingNodeProperty"]),
    update(property, value) {
      this.setCurrentEditingNodeProperty({ property, value })
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
