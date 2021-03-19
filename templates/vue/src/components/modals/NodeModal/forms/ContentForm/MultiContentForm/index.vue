<template>
  <div>
    <b-form-group label="Presentation Style">
      <b-form-select
        id="node-presentation-style"
        data-qa="node-presentation-style"
        :value="node.presentationStyle ? node.presentationStyle : 'accordion'"
        :options="presentationStyle"
        @change="handlePresentationChange"
      ></b-form-select>
    </b-form-group>
    <sub-item-table :actionType="actionType" :node="node"></sub-item-table>
    <b-form-group>
      <b-form-checkbox
        v-if="node.presentationStyle === 'page'"
        :checked="
          node.typeData.hasOwnProperty('showNavBar')
            ? node.typeData.showNavBar
            : true
        "
        data-qa="nav-checkbox"
        @change="node.typeData.showNavBar = $event"
      >
        Add navigation bar on full-screen
      </b-form-checkbox>
    </b-form-group>
    <b-form-group>
      <b-form-checkbox v-model="node.typeData.lockRows" data-qa="lock-checkbox">
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
import SubItemTable from "./SubItemTable.vue"

export default {
  name: "multi-content-form",
  components: { SubItemTable },
  props: {
    node: {
      type: Object,
      required: true,
    },
    actionType: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      presentationStyle: [
        { value: "accordion", text: "Accordion" },
        { value: "slideshow", text: "Slideshow" },
        { value: "page", text: "Page" },
      ],
    }
  },
  mounted() {
    // set node defaults
    this.node.typeData = {
      lockRows: false,
      finishButtonText: "Finish",
      confirmationTitleText: "Section Complete!",
      confirmationBodyText: "Would you like to continue?",
      continueButtonText: "Continue",
      cancelLinkText: "Cancel",
      showNavBar: true,
      ...this.node.typeData,
    }
  },
  methods: {
    handlePresentationChange(evt) {
      this.node.presentationStyle = evt
    },
  },
}
</script>
