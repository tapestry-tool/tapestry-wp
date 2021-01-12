<template>
  <div class="cos">
    <p>I'm temporary!</p>
  </div>
</template>

<script>
import moment from "moment-timezone"
import client from "@/services/TapestryAPI"

export default {
  data() {
    return {
      cos: {
        id: "",
        circles: [],
        communities: [],
        connections: [],
        members: {},
        timestamp: moment(),
      },
    }
  },
  async mounted() {
    this.cos = await client.getCosActivity()
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
