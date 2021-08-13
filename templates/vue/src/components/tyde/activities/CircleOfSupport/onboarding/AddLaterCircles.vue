<template>
  <cos-modal show>
    <b-container>
      <b-row align-h="center" class="py-2">
        <h3>
          You can also delete connections or move connections between rings.
        </h3>
      </b-row>
      <b-row align-h="center">
        <img src="@/assets/delete-connections.gif" />
      </b-row>
      <b-row>
        <b-container>
          <b-row class="py-2">
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
