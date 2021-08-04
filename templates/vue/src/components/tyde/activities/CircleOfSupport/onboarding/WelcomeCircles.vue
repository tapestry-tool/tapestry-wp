<template>
  <cos-modal show>
    <b-container class="confirm">
      <b-row class="py-2 top-left">
        <h2 class="ob-title">
          Now that we have your communities, and connections, we can look at the
          circle View.
        </h2>
      </b-row>
      <b-row align-h="center" class="py-2">
        <h4 class="ob-secondary">
          This the Circle Welcome.
        </h4>
      </b-row>
      <b-row align-h="center" class="mt-2 mb-2">
        <b-overlay :show="loading" rounded="sm">
          <b-button pill variant="secondary" @click="$emit(`continue`)">
            CONTINUE &#8594;
          </b-button>
        </b-overlay>
      </b-row>
    </b-container>
  </cos-modal>
</template>

<script>
import CosModal from "../CosModal"
export default {
  components: {
    CosModal,
  },
  data() {
    return {
      loading: false,
    }
  },
}
</script>

<style scoped lang="scss">
.top-left {
  left: 22px;
  top: 95px;
}
</style>
