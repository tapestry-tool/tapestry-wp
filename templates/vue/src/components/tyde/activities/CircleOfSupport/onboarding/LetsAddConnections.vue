<template>
  <cos-modal show @change="$emit('later')">
    <b-container class="confirm">
      <b-row align-h="center" class="py-2">
        <h3>
          Let's add some connections into your circle.
        </h3>
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
                Click Here to Start!
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
