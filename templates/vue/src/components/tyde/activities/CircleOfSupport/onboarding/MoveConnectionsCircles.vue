<template>
  <cos-modal show @change="$emit('later')">
    <b-container class="confirm">
      <b-row align-h="center" class="py-2">
        <h3>
          Add connections to your circle by dragging and dropping them from the
          connections tab into one of the circle rings.
        </h3>
      </b-row>
      <b-row align-h="center">
        <img :src="gifUrl" />
      </b-row>
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
import gifSrc from "@/assets/add-connection-to-circle.gif"

export default {
  components: {
    CosModal,
  },
  computed: {
    gifUrl() {
      return gifSrc
    },
  },
}
</script>
