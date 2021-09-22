<template>
  <div
    style="height: 100%; width: 100%;"
    @connection-closed="handleConnectionClosed"
    @connection-submitted="handleConnectionSubmitted"
  >
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
      :circleViewEnabled="circleViewEnabled"
      @continue="send(OnboardingEvents.Continue)"
      @done="send(OnboardingEvents.Done)"
    />
    <move-connections-circles
      v-if="isState('Circles.MoveConnections')"
      @continue="send(OnboardingEvents.Continue)"
    />
    <add-confirmation-circles
      v-if="isState('Circles.AddMoreConfirmation')"
      :connections="connections"
      @later="send(OnboardingEvents.AddLater)"
      @another="send(OnboardingEvents.AddAnother)"
    />
    <add-later-circles
      v-if="isState('Circles.AddLaterTooltip')"
      @continue="handleContinue"
    />
    <finish-view-circles
      v-if="isState('Circles.Finish')"
      :connections="connections"
      @ob-finish="send(OnboardingEvents.Done)"
    />
    <tooltip
      v-if="isState('Communities.AddLaterTooltip')"
      class="right bottom"
      :activeView="activeView"
      @tooltip-positioned="$emit('tooltip-positioned')"
    >
      <h3>
        Remember - you can click this button whenever you'd like to add another
        community!
      </h3>
      <b-button
        pill
        variant="secondary"
        @click="handleClick(OnboardingEvents.Continue)"
      >
        Got it &#8594;
      </b-button>
    </tooltip>
    <tooltip
      v-if="isState('Communities.AddAnotherTooltip')"
      class="right bottom"
      :activeView="activeView"
      @tooltip-positioned="$emit('tooltip-positioned')"
    >
      <h3>
        Click here to add another community!
      </h3>
      <b-button pill variant="secondary" @click="handleClick(OnboardingEvents.Add)">
        Got it &#8594;
      </b-button>
    </tooltip>
    <tooltip
      v-if="isState('Connections.AddAnotherTooltip')"
      class="left bottom"
      :activeView="activeView"
      @tooltip-positioned="$emit('tooltip-positioned')"
    >
      <h3 style="max-width:300px;">
        Click here to add some of your connections!
      </h3>
      <b-button pill variant="secondary" @click="handleClick(OnboardingEvents.Add)">
        Got it &#8594;
      </b-button>
    </tooltip>
    <tooltip
      v-if="isState('Circles.Welcome')"
      class="top left"
      :activeView="activeView"
      :style="[{ 'margin-left': activeView === 0 ? '45px' : '0px' }]"
      @tooltip-positioned="$emit('tooltip-positioned')"
    >
      <h3 v-if="activeView === 1" style="width:300px;">
        You can always click here to toggle back to the community view.
      </h3>
      <h3 v-else style="width:300px;">
        Click here to toggle to the circle view.
      </h3>
      <b-button
        v-if="activeView === 1"
        pill
        variant="secondary"
        class="mt-3"
        @click="handleClick(OnboardingEvents.Continue)"
      >
        Continue &#8594;
      </b-button>
    </tooltip>
    <tooltip
      v-if="isState('Circles.AddAnotherTooltip')"
      class="bottom left"
      :activeView="activeView"
      @tooltip-positioned="$emit('tooltip-positioned')"
    >
      <h3 style="width:300px;">
        Try adding some connections into your circle.
      </h3>
      <b-button
        pill
        variant="secondary"
        class="mt-3"
        @click="handleClick(OnboardingEvents.Add)"
      >
        Got it &#8594;
      </b-button>
    </tooltip>
    <tooltip
      v-if="isState('Circles.ToggleRingsTooltip')"
      :activeView="activeView"
      class="top right"
      @tooltip-positioned="$emit('tooltip-positioned')"
    >
      <h3 style="width:300px;">
        Toggle the circle rings by pressing the circle in this box.
      </h3>
      <b-button pill variant="secondary" @click="handleContinue">
        Continue &#8594;
      </b-button>
    </tooltip>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import { interpret } from "xstate"
import onboardingMachine, { OnboardingEvents } from "./onboardingMachine"
import WelcomeCommunities from "./WelcomeCommunities"
import AddConfirmation from "./AddConfirmation"
import AddConfirmationCircles from "./AddConfirmationCircles"
import AddLaterCircles from "./AddLaterCircles"
import WelcomeConnections from "./WelcomeConnections"
import ObFinishView from "./ObFinishView"
import FinishViewCircles from "./FinishViewCircles"
import Tooltip from "./Tooltip"
import MoveConnectionsCircles from "./MoveConnectionsCircles.vue"
const States = {
  Home: 0,
  AddCommunity: 1,
  EditCommunity: 2,
  EditConnection: 3,
  ConnectionClosed: 4,
  AddConnection: 5,
  MoveConnection: 6,
}
export default {
  components: {
    WelcomeCommunities,
    AddConfirmation,
    AddConfirmationCircles,
    WelcomeConnections,
    ObFinishView,
    Tooltip,
    MoveConnectionsCircles,
    AddLaterCircles,
    FinishViewCircles,
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
    parentState: {
      type: Number,
      required: true,
    },
    activeView: {
      type: Number,
      required: true,
    },
    hasConnectionInCircles: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      onboarding: {
        service: interpret(onboardingMachine),
        current: onboardingMachine.initialState,
      },
      OnboardingEvents: OnboardingEvents,
    }
  },
  computed: {
    ...mapState(["settings"]),
    ...mapGetters(["getNode"]),
    circleViewEnabled() {
      const circleViewNode = this.getNode(this.settings.circleViewNode)
      return circleViewNode ? circleViewNode && circleViewNode.completed : true
    },
  },
  watch: {
    communities() {
      this.handleCommunityAdded()
    },
    connections() {
      this.handleConnectionSubmitted()
    },
    parentState() {
      if (this.parentState === States.ConnectionClosed) {
        this.handleConnectionClosed()
        this.$emit("connection-closed")
      }
      if (this.parentState === States.MoveConnection) {
        this.handleConnectionMoved()
      }
    },
  },
  mounted() {
    this.onboarding.service
      .onTransition(state => (this.onboarding.current = state))
      .start()
    this.initializeOnboarding()
  },
  methods: {
    handleConnectionMoved() {
      if (this.onboarding.current.matches("Circles.Form")) {
        this.send(OnboardingEvents.Added)
      }
    },
    handleConnectionClosed() {
      if (
        this.onboarding.current.matches("Connections.FormClosed") ||
        this.onboarding.current.matches("Circles.FormClosed")
      ) {
        this.send(OnboardingEvents.Continue)
      }
    },
    handleConnectionSubmitted() {
      if (
        this.onboarding.current.matches("Circles.Form") ||
        this.onboarding.current.matches("Connections.Form") ||
        this.onboarding.current.matches("Connections.AddAnotherTooltip") ||
        this.onboarding.current.matches("Circles.AddAnotherTooltip")
      ) {
        this.send(OnboardingEvents.Added)
      }
    },
    handleCommunityAdded() {
      if (
        this.onboarding.current.matches("Circles.Form") ||
        this.onboarding.current.matches("Communities.Form") ||
        this.onboarding.current.matches("Communities.AddAnotherTooltip") ||
        this.onboarding.current.matches("Circles.AddAnotherTooltip")
      ) {
        this.send(OnboardingEvents.Added)
      }
    },
    handleContinue(communities) {
      if (this.onboarding.current.matches("Communities.Welcome")) {
        communities.forEach(community => this.$emit("add-community", community))
      }
      this.send(OnboardingEvents.Continue)
    },
    initializeOnboarding() {
      let startingEvent = OnboardingEvents.Empty
      // For now, always initialize the onboarding process at the start
      if (Object.values(this.communities).length <= 0) {
        this.send(startingEvent)
      } else if (
        Object.values(this.connections).length <= 0 &&
        this.activeView === 0
      ) {
        startingEvent = OnboardingEvents.Continue
      } else if (!this.hasConnectionInCircles) {
        startingEvent = OnboardingEvents.NoConnectionsInCircle
      } else {
        startingEvent = OnboardingEvents.Done
      }
      this.send(startingEvent)
    },
    send(event) {
      this.onboarding.service.send(event)
    },
    isState(state) {
      return this.onboarding.current.matches(state)
    },
    handleClick(event) {
      this.send(event)
      this.$emit("tooltip-removed")
    },
  },
}
</script>
