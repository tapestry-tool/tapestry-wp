import { fireEvent } from "@testing-library/vue"
import { render } from "@/utils/test"

import root from "@/fixtures/root.json"
import DuplicateTapestryButton from "@/components/settings-modal/DuplicateTapestryButton.vue"
import client from "@/services/TapestryAPI"

jest.mock("@/services/TapestryAPI", () => {
  return {
    ...jest.requireActual("@/services/TapestryAPI"),
    addTapestry: jest.fn(),
  }
})

describe("duplicate tapestry button", () => {
  it("should show confirmation with the link if duplication succeeds", async () => {
    const slug = "testing"
    client.addTapestry.mockImplementationOnce(() =>
      Promise.resolve({ settings: { tapestrySlug: slug } })
    )

    const screen = render(DuplicateTapestryButton, root)
    fireEvent.click(screen.getByText(/duplicate tapestry/i))

    expect(client.addTapestry).toHaveBeenCalledTimes(1)
    await screen.findByText(/tapestry is ready/i)
    screen.getByText(new RegExp(slug))
  })
})
