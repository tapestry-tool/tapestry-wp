<template>
  <div class="cos">
    <connections
      class="connections"
      :connections="cos.connections"
      :communities="cos.communities"
      @add-connection="addConnection"
    />
  </div>
</template>

<script>
import client from "@/services/TapestryAPI"

import Connections from "./Connections"

export default {
  components: {
    Connections,
  },
  data() {
    return {
      cos: {
        circles: [],
        communities: {},
        connections: {},
      },
    }
  },
  async mounted() {
    const { circles, communities, connections } = await client.cos.getActivity()

    circles.forEach(circle => this.cos.circles.push(circle))
    Object.entries(communities).forEach(([id, community]) =>
      this.$set(this.cos.communities, id, community)
    )
    Object.entries(connections).forEach(([id, connection]) =>
      this.$set(this.cos.connections, id, connection)
    )
  },
  methods: {
    addConnection({ communities, ...newConnection }) {
      if (communities.length) {
        communities.forEach(communityId => {
          const community = this.cos.communities[communityId]
          community.connections.push(newConnection.id)
          this.cos.communities[communityId] = { ...community }
        })
      }
      this.$set(this.cos.connections, newConnection.id, newConnection)
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
  --cos-color-tertiary: #d8d8d8;
  --cos-border: 3px solid var(--cos-color-secondary);

  border: var(--cos-border);
  height: 600px;
  position: relative;
  overflow: hidden;
}

.connections {
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
}
</style>
