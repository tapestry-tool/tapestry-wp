<template>
  <div class="cos">
    <connections
      class="connections"
      :connections="cos.connections"
      :communities="cos.communities"
      @add-connection="addConnection"
      @update-connection="updateConnection"
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
        communities.forEach(communityId =>
          this.addConnectionToCommunity(communityId, newConnection.id)
        )
      }
      this.$set(this.cos.connections, newConnection.id, newConnection)
    },
    updateConnection({ additions, deletions, id, name, avatar }) {
      additions.forEach(communityId =>
        this.addConnectionToCommunity(communityId, id)
      )
      deletions.forEach(communityId =>
        this.removeConnectionFromCommunity(communityId, id)
      )
      this.cos.connections[id] = { id, name, avatar }
    },
    addConnectionToCommunity(communityId, connectionId) {
      const community = this.cos.communities[communityId]
      community.connections.push(connectionId)
      this.cos.communities[communityId] = { ...community }
    },
    removeConnectionFromCommunity(communityId, connectionId) {
      const community = this.cos.communities[communityId]
      community.connections = community.connections.filter(id => id !== connectionId)
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
