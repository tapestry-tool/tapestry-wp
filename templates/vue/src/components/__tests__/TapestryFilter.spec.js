import { waitFor } from "@testing-library/vue"
import userEvent from "@testing-library/user-event"
import { render } from "@/utils/test"
import { nodeStatus } from "@/utils/constants"
import TapestryFilter from "@/components/TapestryFilter.vue"
import multiAuthorTapestry from "@/fixtures/multi-author.json"
import client from "@/services/TapestryAPI"
import * as wp from "@/services/wp"

jest.mock("@/services/TapestryAPI", () => {
  return {
    ...jest.requireActual("@/services/TapestryAPI"),
    getAllContributors: jest.fn().mockResolvedValue(null),
    getTapestry: jest.fn(),
  }
})

const setup = () => {
  const screen = render(TapestryFilter, {
    fixture: multiAuthorTapestry,
  })
  userEvent.click(screen.getByLabelText("search"))
  return screen
}

describe("TapestryFilter", () => {
  it("should be able to change the filter type and have the text placeholder update", async () => {
    const screen = setup()

    await screen.findByPlaceholderText("Node title")

    const select = screen.getByDisplayValue("Title")
    userEvent.click(select)

    const options = ["Title", "Author", "Status"]
    options.forEach(option => screen.getByText(option))

    userEvent.selectOptions(screen.getByDisplayValue("Title"), "Author")
    await screen.findByPlaceholderText("Node author")
  })

  it("should show dropdown of node titles if searching by title", async () => {
    const titles = multiAuthorTapestry.nodes.map(node => node.title)
    const screen = setup()

    userEvent.click(await screen.findByPlaceholderText("Node title"))
    waitFor(() => {
      titles.forEach(title => screen.getByText(title))
    })
  })

  it("should show dropdown of authors if searching by author", async () => {
    const authors = new Set(multiAuthorTapestry.nodes.map(node => node.author))
    const screen = setup()

    userEvent.selectOptions(await screen.findByDisplayValue("Title"), "Author")
    userEvent.click(await screen.findByPlaceholderText("Node author"))
    waitFor(() => {
      authors.forEach(author => screen.getByText(author.name))
    })
  })

  it("should show simple select if searching by status", async () => {
    const statuses = Object.values(nodeStatus)
    const screen = setup()

    userEvent.selectOptions(await screen.findByDisplayValue("Title"), "Status")
    await screen.findByTestId("status-select")

    userEvent.click(screen.getByText("All"))
    statuses.forEach(status => screen.getByText(status))
  })

  it("should reset value if search type is changed", async () => {
    client.getTapestry.mockResolvedValue(multiAuthorTapestry)

    const screen = setup()

    userEvent.selectOptions(await screen.findByDisplayValue("Title"), "Author")
    userEvent.click(await screen.findByPlaceholderText("Node author"))
    userEvent.click(await screen.findByText("admin"))

    userEvent.selectOptions(screen.getByDisplayValue("Author"), "Title")
    expect(await screen.findByPlaceholderText("Node title")).toHaveValue("")
  })

  it("should show loading indicator when superuser override is off", async () => {})

  it("should hide the search bar for unauthorized users", async () => {
    wp.canEditTapestry.mockReturnValueOnce(false)
    const screen = render(TapestryFilter, {
      fixture: multiAuthorTapestry,
    })
    expect(screen.queryByLabelText("search")).toBeNull()
  })
})
