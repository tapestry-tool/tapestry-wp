<template>
  <cos-modal show>
    <b-container class="modal-container">
      <b-row align-h="center">
        <h3 style="max-width:350px;">
          Great job! You have completed the Circle of Support onboarding!
        </h3>
      </b-row>
      <b-row align-h="center">
        <h5 class="ob-secondary">
          You'll be able to edit and add more at any time.
        </h5>
      </b-row>
      <b-col align-self="center">
        <b-button
          pill
          variant="secondary"
          class="secondary"
          @click="$emit('ob-finish')"
        >
          Continue &#8594;
        </b-button>
      </b-col>
    </b-container>
  </cos-modal>
</template>

<script>
import CosModal from "../CosModal"
export default {
  components: {
    CosModal,
  },
}
</script>

<style scoped>
.modal-container {
  width: 50vw;
  min-width: 300px;
  max-width: 650px;
}
.row {
  padding: 10px 0;
}
</style>
