<template>
  <div style="height: 100%; width: 100%;">
    <communities-list
      :communities="communities"
      :connections="connections"
      @edit-connection="editConnection"
      @edit-community="editCommunity"
    />
    <connections-tab
      class="tab"
      :show="isConnectionTabOpen"
      @toggle="toggleConnectionTab"
    >
      <div
        v-if="state === states.AddConnection || state === states.EditConnection"
        class="content-wrapper"
      >
        <b-overlay class="form" :show="isSubmitting">
          <add-connection-form
            v-model="connection"
            :communities="communities"
            @back="state = lastState"
            @submit="handleSubmit"
            @add-community="$emit('add-community', $event)"
          />
        </b-overlay>
      </div>
      <connections-list
        v-else
        :connections="connections"
        :communities="communities"
        @add-connection="openConnectionForm"
        @edit-connection="editConnection"
      />
    </connections-tab>
    <add-community-tab
      v-model="community"
      :show="isCommunityTabOpen"
      @back="state = lastState"
      @add-community="$emit('add-community', $event)"
      @toggle="toggleCommunityTab"
    />
  </div>
</template>

<script>
import client from "@/services/TapestryAPI"

import AddCommunityTab from "./AddCommunityTab"
import ConnectionsTab from "./ConnectionsTab"
import CommunitiesList from "./CommunitiesList"
import AddConnectionForm from "./AddConnectionForm"
import ConnectionsList from "./ConnectionsList"

const States = {
  Home: 0,
  List: 1,
  AddConnection: 2,
  EditConnection: 3,
  AddCommunity: 4,
  EditCommunity: 5,
}

export default {
  components: {
    AddCommunityTab,
    AddConnectionForm,
    CommunitiesList,
    ConnectionsList,
    ConnectionsTab,
  },
  props: {
    connections: {
      type: Object,
      required: true,
    },
    communities: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      state: States.Home,
      lastState: States.Home,
      isSubmitting: false,
      connection: {
        id: "",
        name: "",
        avatar: "😊",
        communities: [],
      },
      community: {
        name: "",
        icon: "👨‍👩‍👦",
        color: "",
      },
    }
  },
  computed: {
    states() {
      return States
    },
    isConnectionTabOpen() {
      return [States.List, States.AddConnection, States.EditConnection].includes(
        this.state
      )
    },
    isCommunityTabOpen() {
      return [States.EditCommunity, States.AddCommunity].includes(this.state)
    },
  },
  watch: {
    state(_, lastState) {
      this.lastState = lastState
    },
  },
  methods: {
    toggleConnectionTab() {
      if (this.isConnectionTabOpen) {
        this.state = States.Home
      } else {
        this.state = States.List
      }
    },
    toggleCommunityTab() {
      if (this.isCommunityTabOpen) {
        this.state = States.Home
      } else {
        this.resetCommunity()
        this.state = States.AddCommunity
      }
    },
    openConnectionForm() {
      this.resetConnection()
      this.state = States.AddConnection
    },
    editCommunity(community) {
      this.community = community
      this.state = States.EditCommunity
    },
    editConnection(connection) {
      this.connection = {
        ...connection,
        communities: connection.communities.map(community => community.id),
      }
      this.state = States.EditConnection
    },
    resetCommunity() {
      this.community = {
        name: "",
        icon: "👨‍👩‍👦",
        color: "",
      }
    },
    resetConnection() {
      this.connection = {
        id: "",
        name: "",
        avatar: "😊",
        communities: [],
      }
    },
    async handleSubmit() {
      this.isSubmitting = true

      switch (this.state) {
        case States.AddConnection:
          await this.addNewConnection()
          break
        case States.EditConnection:
          await this.updateConnection()
          break
        default:
          break
      }

      this.isSubmitting = false
      this.resetConnection()
      this.state = this.lastState
    },
    async addNewConnection() {
      const connection = await client.cos.addConnection({
        name: this.connection.name,
        avatar: this.connection.avatar,
      })

      if (this.connection.communities.length) {
        /**
         * Add connection to community one at a time to avoid race condition where
         * only the last community is kept.
         */
        for (const communityId of this.connection.communities) {
          await client.cos.addConnectionToCommunity(communityId, connection.id)
        }
      }
      this.$emit("add-connection", {
        ...connection,
        communities: this.connection.communities,
      })
    },
    async updateConnection() {
      const currentCommunities = this.getCommunities(this.connection.id)
      await client.cos.updateConnection(this.connection.id, { ...this.connection })

      const { additions, deletions } = this.getDifferences(
        currentCommunities.map(community => community.id),
        this.connection.communities
      )

      for (const addition of additions) {
        await client.cos.addConnectionToCommunity(addition, this.connection.id)
      }

      for (const deletion of deletions) {
        await client.cos.removeConnectionFromCommunity(deletion, this.connection.id)
      }

      this.$emit("update-connection", {
        ...this.connection,
        additions,
        deletions,
      })
    },
    getCommunities(connectionId) {
      return Object.values(this.communities).filter(community =>
        community.connections.includes(connectionId)
      )
    },
    getDifferences(original, newVersion) {
      const additions = newVersion.filter(item => !original.includes(item))
      const deletions = original.filter(item => !newVersion.includes(item))
      return { additions, deletions }
    },
  },
}
</script>

<style scoped>
.tab {
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.form {
  width: 100%;
  height: 100%;
}

.content-wrapper {
  background: white;
  position: relative;
  z-index: 10;
  height: 100%;
  border-top: 1px solid var(--cos-color-tertiary);
  flex-grow: 1;
}
</style>
