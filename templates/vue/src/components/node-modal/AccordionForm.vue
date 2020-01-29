<template>
  <div>
    <b-form-group>
      <b-form-checkbox v-model="node.typeData.lockRows">
        Lock rows until previous row is completed
      </b-form-checkbox>
    </b-form-group>
    <b-form-group label="Finish button text">
      <b-form-input v-model="node.typeData.finishButtonText"></b-form-input>
    </b-form-group>
    <b-form-group label="Confirmation title text">
      <b-form-input v-model="node.typeData.confirmationTitleText"></b-form-input>
    </b-form-group>
    <b-form-group label="Confirmation body text">
      <b-form-input v-model="node.typeData.confirmationBodyText"></b-form-input>
    </b-form-group>
    <b-form-group label="Continue button text">
      <b-form-input v-model="node.typeData.continueButtonText"></b-form-input>
    </b-form-group>
    <b-form-group label="Cancel link text">
      <b-form-input v-model="node.typeData.cancelLinkText"></b-form-input>
    </b-form-group>
  </div>
</template>

<script>
export default {
  name: "accordion-form",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    // set node defaults
    this.node.typeData = {
      ...this.node.typeData,
      lockRows: false,
      finishButtonText: "Finish",
      confirmationTitleText: "Section Complete!",
      confirmationBodyText: "Would you like to continue?",
      continueButtonText: "Continue",
      cancelLinkText: "Cancel",
    }
  },
}
</script>
