<template>
  <cos-modal show @change="$emit('later')">
    <b-container class="confirm">
      <b-row align-h="center" class="py-2">
        <h2 class="ob-title">
          You can add connections to your circle by dragging and dropping them from
          the connections tab into one of the circle rings.
        </h2>
      </b-row>
      <img src="https://media.giphy.com/media/cxcxMvNm5YgWkaMcPS/giphy.gif" />
      <b-row align-h="center" class="py-2">
        <h4 class="ob-secondary">You can also add more connections at any time.</h4>
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
                Continue &#8594;
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
