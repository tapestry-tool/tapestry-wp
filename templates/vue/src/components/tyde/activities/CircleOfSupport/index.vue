<template>
  <div class="cos">
    <pre>{{ JSON.stringify(cos) }}</pre>
  </div>
</template>

<script>
import moment from "moment-timezone"
import client from "@/services/TapestryAPI"
import * as wp from "@/services/wp"

export default {
  data() {
    return {
      cos: {
        id: wp.getCurrentUser().id,
        circles: [],
        communities: [],
        connections: [],
        members: {},
        timestamp: moment().toISOString(),
      },
    }
  },
  async mounted() {
    const latestCosVersion = await client.cos.getActivity()
    this.cos = latestCosVersion
  },
}
</script>

<style scoped>
.cos {
  --cos-color-primary: #000;
  --cos-color-secondary: #c4c4c4;
  border: 3px solid var(--cos-color-secondary);
}
</style>
