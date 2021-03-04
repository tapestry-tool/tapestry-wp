<template>
  <div id="cos" class="cos">
    <div>
      <button class="change-view" @click="view = views.Circle">Circle</button>
      <button class="change-view" @click="view = views.Community">Community</button>
    </div>
    <community-view
      v-if="view === views.Community"
      :connections="cos.connections"
      :communities="cos.communities"
      @add-connection="addConnection"
      @update-connection="updateConnection"
      @add-community="addCommunity"
    />
    <circle-view v-if="view === views.Circle" />
  </div>
</template>

<script>
import client from "@/services/TapestryAPI"
import CommunityView from "./CommunityView"
import CircleView from "./CircleView"

const CosView = {
  Community: 0,
  Circle: 1,
}

export default {
  components: {
    CommunityView,
    CircleView,
  },
  data() {
    return {
      view: CosView.Community,
      cos: {
        circles: [],
        communities: {},
        connections: {},
      },
    }
  },
  computed: {
    views() {
      return CosView
    },
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
</style>
