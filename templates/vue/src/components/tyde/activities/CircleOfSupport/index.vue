<template>
  <div class="cos">
    <connections-tab
      class="tab"
      :connections="cos.connections"
      :communities="cos.communities"
      @add-connection="addConnection"
    />
    <add-community-tab class="tab" @add-community="addCommunity" />
  </div>
</template>

<script>
import AddCommunityTab from "./AddCommunityTab"
import ConnectionsTab from "./ConnectionsTab"

export default {
  components: {
    AddCommunityTab,
    ConnectionsTab,
  },
  data() {
    return {
      cos: {
        circles: [],
        communities: {
          abcdef: {
            id: "abcdef",
            name: "School",
            icon: "🎓",
            color: "#A1BCFC",
            connections: ["abc"],
          },
        },
        connections: {
          abc: {
            id: "abc",
            name: "Nanda",
            avatar: "🤡",
          },
          def: {
            id: "def",
            name: "Shirley",
            avatar: "😊",
          },
        },
      },
    }
  },
  /* async mounted() {
    const latestCosVersion = await client.cos.getActivity()
    this.cos = latestCosVersion
  }, */
  methods: {
    addConnection({ community: communityId, ...newConnection }) {
      if (communityId) {
        const community = this.cos.communities[communityId]
        community.connections.push(newConnection.id)
        this.cos.communities[communityId] = { ...community }
      }
      this.$set(this.cos.connections, newConnection.id, newConnection)
    },
    addCommunity(community) {
      this.$set(this.cos.communities, community.id, community)
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
}

.tab {
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
}
</style>
