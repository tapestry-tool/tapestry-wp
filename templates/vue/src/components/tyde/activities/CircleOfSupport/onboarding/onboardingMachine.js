import { createMachine } from "xstate"

export const OnboardingStates = {
  Welcome: "Welcome",
  MoveConnections: "MoveConnections",
  AddMoreConfirmation: "AddMoreConfirmation",
  AddLaterTooltip: "AddLaterTooltip",
  AddAnotherTooltip: "AddAnotherTooltip",
  ToggleRingsTooltip: "ToggleRingsTooltip",
  Form: "Form",
  FormClosed: "FormClosed",
  Finish: "Finish",
  Complete: "Complete",
}

const Events = {
  Empty: "Empty",
  NoUserCommunities: "NoUserCommunities",
  NoConnections: "NoConnections",
  CommunityOnboardingComplete: "CommunityOnboardingComplete",
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
  id: "CoSOnboarding",
  initial: "Idle",
  states: {
    Idle: {
      on: {
        [Events.Empty]: "#Communities.Welcome",
        [Events.NoUserCommunities]: "#Communities.AddMoreConfirmation",
        [Events.NoConnections]: "#Connections.AddMoreConfirmation",
        [Events.CommunityOnboardingComplete]: "#Circles.Welcome",
        [Events.Continue]: "#Connections",
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
            [Events.Added]: OnboardingStates.AddMoreConfirmation,
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
            [Events.Continue]: OnboardingStates.AddAnotherTooltip,
          },
        },
        AddMoreConfirmation: {
          on: {
            [Events.AddAnother]: OnboardingStates.AddAnotherTooltip,
            [Events.AddLater]: "#Circles",
          },
        },
        AddAnotherTooltip: {
          on: {
            [Events.Add]: OnboardingStates.Form,
            [Events.Added]: OnboardingStates.FormClosed,
          },
        },
        Form: {
          on: {
            [Events.Added]: OnboardingStates.FormClosed,
          },
        },
        FormClosed: {
          on: {
            [Events.Continue]: OnboardingStates.Finish,
          },
        },
        Finish: {
          on: {
            [Events.Done]: "#Circles",
          },
        },
      },
    },
    Circles: {
      id: "Circles",
      initial: OnboardingStates.Welcome,
      states: {
        Welcome: {
          on: {
            [Events.Continue]: OnboardingStates.MoveConnections,
          },
        },
        MoveConnections: {
          on: {
            [Events.Continue]: OnboardingStates.AddAnotherTooltip,
          },
        },
        AddAnotherTooltip: {
          on: {
            [Events.Add]: OnboardingStates.Form,
            [Events.Added]: OnboardingStates.FormClosed,
          },
        },
        Form: {
          on: {
            [Events.Added]: OnboardingStates.FormClosed,
          },
        },
        FormClosed: {
          on: {
            [Events.Continue]: OnboardingStates.AddMoreConfirmation,
          },
        },
        AddMoreConfirmation: {
          on: {
            [Events.AddAnother]: OnboardingStates.Form,
            [Events.AddLater]: OnboardingStates.AddLaterTooltip,
          },
        },
        AddLaterTooltip: {
          on: {
            [Events.Continue]: OnboardingStates.ToggleRingsTooltip,
          },
        },
        ToggleRingsTooltip: {
          on: {
            [Events.Continue]: OnboardingStates.Finish,
          },
        },
        Finish: {
          type: "final",
          on: {
            [Events.Done]: "#Complete",
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
