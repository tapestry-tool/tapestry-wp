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
      @connection-submitted="handleConnectionSubmitted"
      @connection-closed="handleConnectionClosed"
    />
    <add-community-tab
      v-model="community"
      :show="isCommunityTabOpen"
      :disabled="!canAddCommunity"
      @back="state = lastState"
      @add-community="$emit('add-community', $event)"
      @toggle="toggleCommunityTab"
    />
    <welcome-communities
      v-if="isState('Communities.Welcome')"
      class="welcome-communities"
      @continue="handleContinue"
    />
    <welcome-connections 
      v-if="isState('Connections.Welcome')"
      class="welcome-connections"
      @continue="handleContinue"
      />
    <add-confirmation
      v-if="isState('Communities.AddMoreConfirmation')"
      @later="send('AddLater')"
      @another="send('AddAnother')"
    />
      <complete-view 
        v-if="isState('Complete')"
        :connections="connections"
      />
    <tooltip
      v-if="isState('Communities.AddLaterTooltip')"
      position="right"
    >
      <h3>
        Remember - you can click this button whenever you'd like to add another
        community!
      </h3>
      <b-button pill variant="secondary" @click="send('Continue')">Got it &#8594 </b-button>
    </tooltip>
    <tooltip
      v-if="isState('Communities.AddAnotherTooltip')"
      position="right"
    >
      <h3>
        Click here to add another community!
      </h3>
      <b-button pill variant="secondary" @click="send('Add')">Got it &#8594 </b-button>
    </tooltip>
    <tooltip
      v-if="isState('Connections.AddAnotherTooltip')"
      position="left"
    >
      <h3>
        Click here to add some <br /> of your connections!
      </h3>
      <b-button pill variant="secondary" @click="send('Add')">Got it &#8594 </b-button>
    </tooltip>
  </div>
</template>

<script>
import { interpret } from "xstate"
import AddCommunityTab from "./AddCommunityTab"
import ConnectionsTab from "../ConnectionsTab"
import CommunitiesList from "./CommunitiesList"
import { MAX_COMMUNITIES } from "../cos.config"

import onboardingMachine, { OnboardingEvents, OnboardingStates } from "./onboardingMachine"
import WelcomeCommunities from "./onboarding/WelcomeCommunities"
import AddConfirmation from "./onboarding/AddConfirmation"
import WelcomeConnections from "./onboarding/WelcomeConnections"
import CompleteView from "./onboarding/CompleteView"
import Tooltip from "./onboarding/Tooltip"

const States = {
  Home: 0,
  AddCommunity: 1,
  EditCommunity: 2,
  EditConnection: 3,
  AddConnection: 4
}

export default {
  components: {
    AddCommunityTab,
    CommunitiesList,
    ConnectionsTab,
    WelcomeCommunities,
    AddConfirmation,
    WelcomeConnections,
    CompleteView,
    Tooltip,
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
      if(this.onboarding.current.matches('Communities.Welcome')) {
        communities.forEach(community => this.$emit("add-community", community))
      }
      
      this.send(OnboardingEvents.Continue)
    },
    toggleCommunityTab() {
      if (this.isCommunityTabOpen) {
        this.state = States.Home

        if(this.onboarding.current.matches("Communities.Form")) {
          this.send('Added');
        }

      } else {
        this.resetCommunity()
        this.state = States.AddCommunity

        // Check to avoid opening confirmation if user hit Later
        if (!this.onboarding.current.matches('Communities.Form')){
          this.send("Add")
        }
      }
    },
    handleConnectionSubmitted() { 
      
        if(this.onboarding.current.matches("Connections.Form") ||
            this.onboarding.current.matches("Connections.AddAnotherTooltip")) {
          this.send("Added")
        }
      
    },
    handleConnectionClosed(){
      
    if(this.onboarding.current.matches("Connections.Closed")) {
        this.send("Done")
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
* {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
}

.welcome-communities {
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
