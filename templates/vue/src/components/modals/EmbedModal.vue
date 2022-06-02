<template>
  <b-modal
    id="embed-modal"
    data-qa="embed-modal"
    :visible="show"
    size="lg"
    title="Create Embed"
    body-class="p-0"
    @hidden="$emit('close')"
  >
    <b-container fluid class="pt-3">
      <b-form-row>
        <b-col>
          <b-form-group label="Width">
            <b-form-input v-model="width" type="number"></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label="Height">
            <b-form-input v-model="height" type="number"></b-form-input>
          </b-form-group>
        </b-col>
      </b-form-row>
      <b-form-group
        label="iFrame Code"
        description="Click to select, then copy and paste the code to your page for embedding this Tapestry."
      >
        <b-form-textarea
          ref="code"
          class="embed-code"
          readonly
          :value="embed"
          @focus="handleFocus"
        ></b-form-textarea>
      </b-form-group>
    </b-container>
    <template slot="modal-footer">
      <b-button
        data-qa="embed-close-button"
        size="sm"
        variant="primary"
        @click="$emit('close')"
      >
        Done
      </b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: "embed-modal",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      width: 800,
      height: 600,
    }
  },
  computed: {
    embed() {
      return `<iframe width="${this.width}" height="${this.height}" style="border: none;" src="${location.origin}${location.pathname}?iframe" />`
    },
  },
  mounted() {
    console.log(this.$router)
  },
  methods: {
    handleFocus() {
      this.$refs.code.select()
    },
  },
}
</script>

<style lang="scss" scoped>
.embed-code {
  font-family: monospace;
}
</style>
