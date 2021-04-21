import { createMachine } from "xstate"

export const OnboardingStates = {
  Welcome: "Welcome",
  AddMoreConfirmation: "AddMoreConfirmation",
  AddLaterTooltip: "AddLaterTooltip",
  AddAnotherTooltip: "AddAnotherTooltip",
  Form: "Form",
  Complete: "Complete",
}

const Events = {
  Empty: "Empty",
  NoUserCommunities: "NoUserCommunities",
  NoConnections: "NoConnections",
  Done: "Done",
  Continue: "Continue",
  AddLater: "AddLater",
  AddAnother: "AddAnother",
  Add: "Add",
  Added: "Added",
}

export const OnboardingEvents = Events

/**
 * A state machine that handles onboarding states for the community view, defined
 * using xstate.
 */
const onboardingMachine = createMachine({
  id: "CommunityViewOnboarding",
  initial: "Idle",
  states: {
    Idle: {
      on: {
        [Events.Empty]: "#Communities.Welcome",
        [Events.NoUserCommunities]: "#Communities.AddMoreConfirmation",
        [Events.NoConnections]: "#Connections.AddMoreConfirmation",
        [Events.Done]: OnboardingStates.Complete,
      },
    },
    Communities: {
      id: "Communities",
      initial: OnboardingStates.Welcome,
      states: {
        Welcome: {
          on: {
            [Events.Continue]: OnboardingStates.AddMoreConfirmation,
          },
        },
        AddMoreConfirmation: {
          on: {
            [Events.AddAnother]: OnboardingStates.AddAnotherTooltip,
            [Events.AddLater]: OnboardingStates.AddLaterTooltip,
          },
        },
        AddAnotherTooltip: {
          on: {
            [Events.Add]: OnboardingStates.Form,
          },
        },
        Form: {
          on: {
            [Events.Added]: OnboardingStates.AddMoreConfirmation,
          },
        },
        AddLaterTooltip: {
          type: "final",
          on: {
            [Events.Continue]: "#Connections",
          },
        },
      },
    },
    Connections: {
      id: "Connections",
      initial: OnboardingStates.Welcome,
      states: {
        Welcome: {
          on: {
            [Events.Continue]: OnboardingStates.AddMoreConfirmation,
          },
        },
        AddMoreConfirmation: {
          on: {
            [Events.AddAnother]: OnboardingStates.AddAnotherTooltip,
            [Events.AddLater]: OnboardingStates.Complete,
          },
        },
        AddAnotherTooltip: {
          on: {
            [Events.Add]: OnboardingStates.Form,
          },
        },
        Form: {
          on: {
            [Events.Added]: OnboardingStates.AddMoreConfirmation,
          },
        },
      },
    },
    Complete: {
      id: OnboardingStates.Complete,
      type: "final",
    },
  },
})

export default onboardingMachine
