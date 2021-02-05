<template>
  <b-form-group label="Gravity Form">
    <combobox
      v-model="node.typeData.mediaURL"
      data-testid="node-gravity-form-id"
      item-text="title"
      item-value="id"
      empty-message="There are no Gravity Forms available. You need to first create a Gravity Form to use here."
      :options="options"
    >
      <template v-slot="{ option }">
        <p>
          <code>{{ option.id }}</code>
          {{ option.title }}
        </p>
      </template>
    </combobox>
  </b-form-group>
</template>

<script>
import Combobox from "@/components/modals/common/Combobox"
import GravityFormsApi from "@/services/GravityFormsApi"

export default {
  components: {
    Combobox,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      options: [],
    }
  },
  mounted() {
    GravityFormsApi.getAllForms().then(options => {
      this.options = options
    })
  },
}
</script>
