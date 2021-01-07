<template>
  <p>I'm temporary!</p>
</template>

<script>
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
      },
    }
  },
  async mounted() {
    this.cos = await client.getCosActivity()
  },
}
</script>
