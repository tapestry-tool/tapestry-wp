import userEvent from "@testing-library/user-event"
import { render } from "@/utils/test"

import CircleOfSupport from "."

jest.mock("@/services/TapestryAPI", () => ({
  ...jest.requireActual("@/services/TapestryAPI"),
  cos: {
    getActivity: jest.fn().mockResolvedValue({
      id: "",
      connections: {},
      communities: {},
      circles: [],
      members: {},
    }),
  },
}))

describe("CircleOfSupport", () => {
  it("should show list of connections", async () => {
    const screen = render(CircleOfSupport)
    userEvent.click(screen.getByRole("button", { name: /connections/i }))

    await screen.findByRole("button", { name: /add/i })
  })
})
