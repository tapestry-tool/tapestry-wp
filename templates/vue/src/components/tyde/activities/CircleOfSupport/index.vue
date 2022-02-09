<template>
  <div id="cos" class="cos">
    <div class="contents">
      <community-view
        v-if="view === views.Community"
        :connections="cos.connections"
        :communities="cos.communities"
        :is-read-only="isReadOnly"
        @add-connection="addConnection"
        @edit-connection="editConnection"
        @delete-connection="handleDeleteConnection"
        @add-community="addCommunity"
        @delete-community="handleDeleteCommunity"
      />
      <circle-view
        v-if="view === views.Circle"
        v-model="cos.circles"
        :connections="cos.connections"
        :communities="cos.communities"
        :is-read-only="isReadOnly"
        @add-connection="addConnection"
        @edit-connection="editConnection"
        @delete-connection="handleDeleteConnection"
        @add-community="addCommunity"
        @delete-community="handleDeleteCommunity"
      />
      <div class="header">
        <div class="switch">
          <button
            :class="['change-view', { active: view === views.Community }]"
            aria-label="Community view"
            @click="view = views.Community"
          >
            <div class="community-view"></div>
          </button>
          <button
            :class="['change-view', { active: view === views.Circle }]"
            aria-label="Circle view"
            @click="view = views.Circle"
          >
            <div class="circle-view"></div>
          </button>
        </div>
        <h5 class="mt-3">
          {{ view === views.Circle ? "Circle" : "Community" }} View
        </h5>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex"
import client from "@/services/TapestryAPI"
import { dyadLinkedUser } from "@/services/wp"
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
    }
  },
  computed: {
    ...mapState(["cos"]),
    views() {
      return CosView
    },
    isReadOnly() {
      return !!dyadLinkedUser()
    },
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
    removeCommunityFromConnection(connectionId, communityId) {
      const connection = this.cos.connections[connectionId]
      if (connection.communities) {
        connection.communities = connection.communities.filter(
          id => id !== communityId
        )
      }
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
    async handleDeleteCommunity(communityId) {
      await client.cos.deleteCommunity(communityId)

      delete this.cos.communities[communityId]

      Object.values(this.cos.connections).forEach(connection => {
        this.removeCommunityFromConnection(connection.id, communityId)
      })
    },
  },
}
</script>

<style scoped lang="scss">
[data-theme="light"] .cos {
  --cos-bg-primary: #f8f8f8;
  --cos-text-tertiary: #aaa;
  --cos-hover: #4bb0f9;
}
[data-theme="dark"] .cos {
  --cos-bg-primary: #111;
  --cos-text-tertiary: #666;
}
.cos {
  --cos-bg-secondary: var(--bg-color-primary);
  --cos-bg-tertiary: var(--bg-color-secondary);
  --cos-text-primary: var(--text-color-primary);
  --cos-text-secondary: var(--text-color-tertiary);
  --cos-border: 3px solid var(--cos-bg-tertiary);
  --cos-hover: #4bb0f9;

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
  position: relative;
  background: var(--cos-bg-primary);
  height: 100%;
  border-radius: 25px;
  border: var(--cos-border);
  overflow: hidden;
  .header {
    position: absolute;
    top: 1rem;
    left: 1rem;
    .switch {
      display: flex;
    }
    h5 {
      color: var(--cos-text-secondary);
      position: absolute;
      width: 120px;
    }
  }
}

.change-view {
  width: 50%;
  background: var(--cos-bg-secondary);
  border: 2px solid var(--cos-bg-tertiary);

  --icon-size: 1.5rem;

  &:hover {
    > div {
      transform: scale(1.3);
    }
  }

  &.active {
    background: var(--cos-bg-tertiary);

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
  border: 2px solid var(--cos-bg-tertiary);
  border-top-left-radius: 9999px;
  border-top-right-radius: 9999px;
  background: white;
}

.circle-view {
  width: var(--icon-size);
  height: var(--icon-size);
  border-radius: 50%;
  border: 2px solid var(--cos-bg-tertiary);
  background: white;
}
</style>
