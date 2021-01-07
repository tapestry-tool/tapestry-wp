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
    await client.saveCosActivity(this.cos)
    const cos = await client.getCosActivity()
    console.log(cos)
  },
}
</script>
