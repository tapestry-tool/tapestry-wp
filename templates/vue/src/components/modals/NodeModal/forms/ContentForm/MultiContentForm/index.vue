<template>
  <div>
    <b-form-group label="Presentation Style" label-for="node-presentation-style">
      <b-form-select
        id="node-presentation-style"
        data-qa="node-presentation-style"
        :value="presentationStyle ? presentationStyle : 'accordion'"
        :options="presentationStyles"
        @change="handlePresentationChange"
      ></b-form-select>
    </b-form-group>
    <sub-item-table :actionType="actionType"></sub-item-table>
    <b-form-group>
      <b-form-checkbox
        :checked="typeData.lockRows"
        data-qa="lock-checkbox"
        @input="update('typeData.lockRows', $event)"
      >
        Lock rows until previous row is completed
      </b-form-checkbox>
    </b-form-group>
    <b-form-group label="Finish button text" label-for="finish-button-text">
      <b-form-input
        id="finish-button-text"
        :value="typeData.finishButtonText"
        @update="update('typeData.finishButtonText', $event)"
      ></b-form-input>
    </b-form-group>
    <b-form-group
      label="Confirmation title text"
      label-for="confirmation-title-text"
    >
      <b-form-input
        id="confirmation-title-text"
        :value="typeData.confirmationTitleText"
        @update="update('typeData.confirmationTitleText', $event)"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Confirmation body text" label-for="confirmation-body-text">
      <b-form-input
        id="confirmation-body-text"
        :value="typeData.confirmationBodyText"
        @update="update('typeData.confirmationBodyText', $event)"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Continue button text" label-for="continue-button-text">
      <b-form-input
        id="continue-button-text"
        :value="typeData.continueButtonText"
        @update="update('typeData.continueButtonText', $event)"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Cancel link text" label-for="cancel-link-text">
      <b-form-input
        id="cancel-link-text"
        :value="typeData.cancelLinkText"
        @update="update('typeData.cancelLinkText', $event)"
      ></b-form-input>
    </b-form-group>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex"
import SubItemTable from "../common/SubItemTable.vue"

export default {
  name: "multi-content-form",
  components: { SubItemTable },
  props: {
    actionType: {
      type: String,
      required: true,
    },
    isUnitChild: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    ...mapState({
      typeData: state => state.currentEditingNode.typeData,
      presentationStyle: state => state.currentEditingNode.presentationStyle,
    }),
    presentationStyles() {
      if (this.isUnitChild) {
        return [{ value: "page", text: "Page" }]
      }
      return [
        { value: "accordion", text: "Accordion" },
        { value: "page", text: "Page" },
        { value: "unit", text: "Unit (collection of pages)" },
      ]
    },
  },
  mounted() {
    // set node defaults
    this.update("typeData", {
      lockRows: false,
      finishButtonText: "Finish",
      confirmationTitleText: "Section Complete!",
      confirmationBodyText: "Would you like to continue?",
      continueButtonText: "Continue",
      cancelLinkText: "Cancel",
      showNavBar: true,
      ...this.typeData,
    })
  },
  methods: {
    ...mapMutations(["setCurrentEditingNodeProperty"]),
    update(property, value) {
      this.setCurrentEditingNodeProperty({ property, value })
    },
    handlePresentationChange(evt) {
      this.update("presentationStyle", evt)
    },
  },
}
</script>
