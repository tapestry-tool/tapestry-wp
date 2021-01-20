<template>
  <div class="cos">
    <pre>{{ JSON.stringify(cos) }}</pre>
    <button @click="addConnection">Add connection</button>
    <button @click="updateConnection">Update connection</button>
  </div>
</template>

<script>
import client from "@/services/TapestryAPI"

export default {
  data() {
    return {
      cos: {
        circles: [],
        communities: {},
        connections: {},
        members: {},
      },
    }
  },
  async mounted() {
    const latestCosVersion = await client.cos.getActivity()
    this.cos = latestCosVersion
  },
  methods: {
    async addConnection() {
      const connection = await client.cos.addConnection({
        name: "Nanda",
        avatar: "🤔",
      })
      this.$set(this.cos.connections, connection.id, connection)
    },
    async updateConnection() {
      const [id, currentConnection] = Object.entries(this.cos.connections)[0]
      const connection = await client.cos.updateConnection(id, {
        ...currentConnection,
        avatar: "🤡",
      })
      this.cos.connections[id] = connection
    },
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
