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
      @add-community="obHandleAdded($event)"
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
      @later="send(OnboardingEvents.AddLater)"
      @another="send(OnboardingEvents.AddAnother)"
    />
      <ob-finish-view 
        v-if="isState('Connections.Finish')"
        :connections="connections"
        @ob-finish="send(OnboardingEvents.Done)"
      />
    <tooltip
      v-if="isState('Communities.AddLaterTooltip')"
      position="right"
    >
      <h3>
        Remember - you can click this button whenever you'd like to add another
        community!
      </h3>
      <b-button pill variant="secondary" @click="send(OnboardingEvents.Continue)">Got it &#8594 </b-button>
    </tooltip>
    <tooltip
      v-if="isState('Communities.AddAnotherTooltip')"
      position="right"
    >
      <h3>
        Click here to add another community!
      </h3>
      <b-button pill variant="secondary" @click="send(OnboardingEvents.Add)">Got it &#8594 </b-button>
    </tooltip>
    <tooltip
      v-if="isState('Connections.AddAnotherTooltip')"
      position="left"
    >
      <h3>
        Click here to add some <br /> of your connections!
      </h3>
      <b-button pill variant="secondary" @click="send(OnboardingEvents.Add)">Got it &#8594 </b-button>
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
import ObFinishView from "./onboarding/ObFinishView"
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
    ObFinishView,
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
      let startingEvent = OnboardingEvents.Empty;
      // For now, always initialize the onboarding process at the start
      if(Object.values(this.communities).length > 0){
       startingEvent = OnboardingEvents.Continue

       if(Object.values(this.connections).length > 0)
       {
         startingEvent = OnboardingEvents.Done
       }
      }
      this.send(startingEvent)

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
      } else {
        this.resetCommunity()
        this.state = States.AddCommunity
      }
    },
    obHandleAdded($event) {
        this.$emit('add-community', $event)

        if(this.onboarding.current.matches("Communities.Form")) {
              this.send(OnboardingEvents.Added);
      }
    },
    handleConnectionSubmitted() { 
      
        if(this.onboarding.current.matches("Connections.Form") ||
            this.onboarding.current.matches("Connections.AddAnotherTooltip")) {
          this.send(OnboardingEvents.Added)
        }
      
    },
    handleConnectionClosed(){
    if(this.onboarding.current.matches("Connections.FormClosed")) {
        this.send(OnboardingEvents.Continue)
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
