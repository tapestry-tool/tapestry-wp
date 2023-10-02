<template>
  <cos-modal show @change="$emit('later')">
    <b-container class="confirm">
      <b-row align-h="center" class="py-2">
        <h3>
          To view connections in only one of the circles, click on this circle to
          toggle between the circles and keep going to view all of them again
        </h3>
      </b-row>
      <b-row>
        <b-col>
          <img :src="gifUrl" />
        </b-col>
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
import gifSrc from "@/assets/circle-selections.gif"

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
