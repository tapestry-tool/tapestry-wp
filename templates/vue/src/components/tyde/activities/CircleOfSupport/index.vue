<template>
  <div id="cos" class="cos">
    <loading v-if="isLoading" />
    <div v-else class="contents">
      <community-view
        v-if="view === views.Community"
        :connections="cos.connections"
        :communities="cos.communities"
        :activeView="view"
        :has-connection-in-circles="hasConnectionInCircles"
        @add-connection="addConnection"
        @edit-connection="editConnection"
        @delete-connection="handleDeleteConnection"
        @add-community="addCommunity"
      />
      <circle-view
        v-if="view === views.Circle"
        v-model="cos.circles"
        :connections="cos.connections"
        :communities="cos.communities"
        :activeView="view"
        :has-connection-in-circles="hasConnectionInCircles"
        @add-connection="addConnection"
        @edit-connection="editConnection"
        @delete-connection="handleDeleteConnection"
        @add-community="addCommunity"
      />
      <div class="switch">
        <button
          :class="['change-view', { active: view === views.Community }]"
          aria-label="Community view"
          @click="view = views.Community"
        >
          <div class="community-view"></div>
        </button>
        <button
          :class="[
            'change-view',
            { active: view === views.Circle },
            { disabled: !circleViewEnabled },
          ]"
          aria-label="Circle view"
          :disabled="!circleViewEnabled"
          @click="view = views.Circle"
        >
          <div class="circle-view"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import client from "@/services/TapestryAPI"
import Loading from "@/components/common/Loading"
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
    Loading,
  },
  data() {
    return {
      isLoading: true,
      view: CosView.Community,
      cos: {
        circles: [],
        communities: {},
        connections: {},
      },
      hasConnectionInCircles: false,
    }
  },
  computed: {
    ...mapState(["settings"]),
    ...mapGetters(["getNode"]),
    views() {
      return CosView
    },
    circleViewEnabled() {
      const circleViewNode = this.getNode(this.settings.circleViewNode)
      return circleViewNode ? circleViewNode && circleViewNode.completed : true
    },
  },
  updated() {
    this.countConnectionsInCircle(this.cos)
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
    this.isLoading = false
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
    editConnection({ additions, deletions, id, name, avatar }) {
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
    async handleDeleteConnection(connectionId) {
      delete this.cos.connections[connectionId]

      Object.values(this.cos.communities).forEach(community => {
        this.removeConnectionFromCommunity(community.id, connectionId)
      })

      const newCircles = []
      this.cos.circles.forEach(circle => {
        const newCircle = circle.filter(connection => connection !== connectionId)
        newCircles.push(newCircle)
      })
      this.cos.circles = newCircles
    },
    countConnectionsInCircle(cos) {
      let count = 0
      let connections = Object.keys(cos.connections)
      cos.circles.forEach(circle => {
        connections.forEach(connection => {
          if (circle.includes(connection)) {
            count = count + 1
          }
        })
      })
      this.hasConnectionInCircles = count > 0
      console.log(this.hasConnectionInCircles)
    },
  },
}
</script>

<style scoped lang="scss">
.cos {
  --cos-color-primary: #000;
  --cos-color-secondary: #c4c4c4;
  --cos-color-tertiary: #d8d8d8;
  --cos-border: 3px solid var(--cos-color-secondary);

  border: var(--cos-border);
  height: calc(100vh - 150px);
  width: 98vw;
  min-height: 250px;
  min-width: 320px;
  position: relative;
  margin: 0 auto;
  top: calc(50% + 30px);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  overflow: hidden;
}

.contents {
  height: 100%;
}

.switch {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
}

.change-view {
  width: 50%;
  background: white;
  border: 2px solid var(--cos-color-tertiary);

  --icon-size: 1.5rem;

  &:hover {
    > div {
      transform: scale(1.3);
    }
  }

  &.active {
    background: var(--cos-color-tertiary);

    > div {
      transform: scale(1.5);
    }
  }

  &:first-child {
    border-top-left-radius: 1rem;
    border-bottom-left-radius: 1rem;
  }

  &:last-child {
    border-top-right-radius: 1rem;
    border-bottom-right-radius: 1rem;
  }
}

.community-view {
  width: var(--icon-size);
  height: var(--icon-size);
  border: 2px solid var(--cos-color-tertiary);
  border-top-left-radius: 9999px;
  border-top-right-radius: 9999px;
  background: white;
}

.circle-view {
  width: var(--icon-size);
  height: var(--icon-size);
  border-radius: 50%;
  border: 2px solid var(--cos-color-tertiary);
  background: white;
}
</style>
