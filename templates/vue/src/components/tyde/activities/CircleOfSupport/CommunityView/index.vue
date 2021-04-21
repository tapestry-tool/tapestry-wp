<template>
  <div style="height: 100%; width: 100%;">
    <communities-list
      :communities="communities"
      :connections="connections"
      @edit-connection="editConnection"
      @edit-community="editCommunity"
    />
    <connections-tab
      ref="connections"
      class="tab"
      :connections="connections"
      :communities="communities"
      @back="handleBack"
      @add-connection="$emit('add-connection', $event)"
      @edit-connection="handleEditConnection"
      @add-community="$emit('add-community', $event)"
    />
    <add-community-tab
      v-model="community"
      :show="isCommunityTabOpen"
      :disabled="!canAddCommunity"
      @back="state = lastState"
      @add-community="$emit('add-community', $event)"
      @toggle="toggleCommunityTab"
    />
    <welcome-screen
      v-if="isState('Communities.Welcome')"
      class="welcome-screen"
      @continue="handleContinue"
    />
  </div>
</template>

<script>
import { interpret } from "xstate"
import AddCommunityTab from "./AddCommunityTab"
import ConnectionsTab from "../ConnectionsTab"
import CommunitiesList from "./CommunitiesList"
import { MAX_COMMUNITIES } from "../cos.config"

import onboardingMachine, { OnboardingEvents } from "./onboardingMachine"
import WelcomeScreen from "./onboarding/WelcomeScreen"

const States = {
  Home: 0,
  AddCommunity: 1,
  EditCommunity: 2,
  EditConnection: 3,
}

export default {
  components: {
    AddCommunityTab,
    CommunitiesList,
    ConnectionsTab,
    WelcomeScreen,
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
      onboarding: {
        service: interpret(onboardingMachine),
        current: onboardingMachine.initialState,
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
    isCommunityTabOpen() {
      return [States.EditCommunity, States.AddCommunity].includes(this.state)
    },
    canAddCommunity() {
      return Object.keys(this.communities).length < MAX_COMMUNITIES
    },
  },
  watch: {
    state(_, lastState) {
      this.lastState = lastState
    },
  },
  created() {
    this.onboarding.service
      .onTransition(state => (this.onboarding.current = state))
      .start()
    this.initializeOnboarding()
  },
  methods: {
    send(event) {
      this.onboarding.service.send(event)
    },
    isState(state) {
      return this.onboarding.current.matches(state)
    },
    initializeOnboarding() {
      // For now, always initialize the onboarding process at the start
      this.send(OnboardingEvents.Empty)

      // TODO: Switch to onboarding state on initial load
    },
    handleContinue(communities) {
      communities.forEach(community => this.$emit("add-community", community))
      this.send(OnboardingEvents.Continue)
    },
    toggleCommunityTab() {
      if (this.isCommunityTabOpen) {
        this.state = States.Home
      } else {
        this.resetCommunity()
        this.state = States.AddCommunity
      }
    },
    editCommunity(community) {
      this.community = community
      this.state = States.EditCommunity
    },
    resetCommunity() {
      this.community = {
        name: "",
        icon: "👨‍👩‍👦",
        color: "",
      }
    },
    editConnection(connection) {
      this.state = States.EditConnection
      this.$refs.connections.editConnection(connection)
    },
    handleBack() {
      if (this.state === States.EditConnection) {
        this.state = States.Home
        this.$refs.connections.close()
      }
    },
    handleEditConnection(event) {
      this.handleBack()
      this.$emit("edit-connection", event)
    },
  },
}
</script>

<style scoped>
.welcome-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.tab {
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
}
</style>
