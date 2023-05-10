<template>
  <cos-modal show>
    <b-container class="confirm">
      <b-row align-h="center" class="py-2">
        <h2 class="ob-title">
          You can also delete or move connections between rings.
        </h2>
      </b-row>
      <b-row align-h="center">
        <img src="https://media.giphy.com/media/X6Qs1RYrQ1qYP3lxM0/giphy.gif" />
      </b-row>
      <b-row>
        <b-container>
          <b-row class="controls py-2">
            <b-col>
              <b-button
                pill
                variant="secondary"
                class="secondary"
                @click="$emit('continue')"
              >
                Next &#8594;
              </b-button>
            </b-col>
          </b-row>
        </b-container>
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
}
</script>
