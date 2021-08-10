<template>
  <cos-modal show @change="$emit('later')">
    <b-container class="confirm">
      <b-row align-h="center" class="py-2">
        <h3>
          Add connections to your circle by dragging and dropping them from the
          connections tab into one of the circle rings.
        </h3>
      </b-row>
      <img src="https://media.giphy.com/media/jduo3uSe0KZsKL9Jbb/giphy.gif" />
      <b-row align-h="center" class="py-2">
        <h4 class="ob-secondary">
          You can also add more connections at any time in the connections tab.
        </h4>
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
