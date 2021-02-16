<template>
  <div class="cos">
    <communities-view :communities="cos.communities" />
    <div class="test-controls">
      <button @click="addMockCommunity">+</button>
      <button @click="removeMockCommunity">-</button>
    </div>
    <connections-tab
      class="tab"
      :connections="cos.connections"
      :communities="cos.communities"
      @add-connection="addConnection"
      @add-community="addCommunity"
      @update-connection="updateConnection"
    />
    <add-community-tab @add-community="addCommunity" />
  </div>
</template>

<script>
import client from "@/services/TapestryAPI"
import Helpers from "@/utils/Helpers"

import AddCommunityTab from "./AddCommunityTab"
import ConnectionsTab from "./ConnectionsTab"
import CommunitiesView from "./CommunitiesView"

export default {
  components: {
    AddCommunityTab,
    ConnectionsTab,
    CommunitiesView,
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
    addCommunity(community) {
      this.$set(this.cos.communities, community.id, community)
    },
    addMockCommunity() {
      const community = {
        id: Helpers.createUUID(),
        name: "School",
        icon: "🎓",
        color: "#A1BCFC",
        connections: ["abc"],
      }
      this.$set(this.cos.communities, community.id, community)
    },
    removeMockCommunity() {
      const keys = Object.keys(this.cos.communities)
      const last = keys[keys.length - 1]
      this.$delete(this.cos.communities, last)
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
.test-controls {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

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

.tab {
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
}
</style>
