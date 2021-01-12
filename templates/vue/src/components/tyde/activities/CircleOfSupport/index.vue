<template>
  <p>I'm temporary!</p>
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
