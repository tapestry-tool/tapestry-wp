<template>
  <cos-modal show>
    <b-container class="modal-container">
      <b-row align-h="center">
        <h3 style="min-height:100px;">
          🎉 Great job!🎉
        </h3>
        <h3>
          Don't forget to keep your circle of support updated. You can always come
          back here to add connections, communities, and update your circles.
        </h3>
      </b-row>
      <b-col align-self="center">
        <b-button
          pill
          variant="secondary"
          class="secondary"
          @click="$emit('ob-finish')"
        >
          Finish &#8594;
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
