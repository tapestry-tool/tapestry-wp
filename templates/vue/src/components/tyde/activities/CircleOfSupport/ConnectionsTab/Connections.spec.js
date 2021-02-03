import userEvent from "@testing-library/user-event"
import { render } from "@/utils/test"

import Connections from "."
import { waitFor } from "@testing-library/vue"

const mockCos = {
  communities: {
    abcdef: {
      id: "abcdef",
      name: "School",
      icon: "🎓",
      color: "#A1BCFC",
      connections: ["abc"],
    },
  },
  connections: {
    abc: {
      id: "abc",
      name: "Nanda",
      avatar: "🤡",
    },
    def: {
      id: "def",
      name: "Shirley",
      avatar: "😊",
    },
  },
}

describe("CircleOfSupport — Connections", () => {
  it("should show list of connections when opened", async () => {
    const { connections, communities } = mockCos
    const screen = render(Connections, {
      props: { connections, communities },
    })
    userEvent.click(screen.getByRole("button", { name: /connections/i }))

    await waitFor(() => {
      Object.values(connections).forEach(({ avatar }) => screen.getByText(avatar))
    })
  })

  it.todo("should be able to add a connection")

  it.todo("should be able to cancel adding a connection")

  it.todo(
    "should show form errors if user tries to submit without filling all fields"
  )

  it.todo("should be able to open the add community tab")
})
