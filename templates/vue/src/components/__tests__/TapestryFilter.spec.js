import userEvent from "@testing-library/user-event"
import { render } from "@/utils/test"
import TapestryFilter from "@/components/TapestryFilter.vue"
import multiAuthorTapestry from "@/fixtures/multi-author.json"

jest.mock("@/services/TapestryAPI", () => {
  return {
    ...jest.requireActual("@/services/TapestryAPI"),
    getAllContributors: jest.fn().mockResolvedValue(null),
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
    screen.getByPlaceholderText("Node author")
  })

  it("should show dropdown of node titles if searching by title", async () => {
    const titles = multiAuthorTapestry.nodes.map(node => node.title)
    const screen = setup()

    userEvent.click(await screen.findByPlaceholderText("Node title"))
    titles.forEach(title => screen.getByText(title))
  })

  it("should show dropdown of authors if searching by author", async () => {
    const authors = new Set(multiAuthorTapestry.nodes.map(node => node.author))
    const screen = setup()

    userEvent.selectOptions(await screen.findByDisplayValue("Title"), "Author")
    userEvent.click(screen.getByPlaceholderText("Node author"))
    authors.forEach(author => screen.getByText(author.name))
  })

  it("should show simple select if searching by status", async () => {
    const statuses = ["All", "Published", "Submitted", "Rejected", "Draft"]
    const screen = setup()

    userEvent.selectOptions(await screen.findByDisplayValue("Title"), "Status")
    screen.getByTestId("status-select")

    userEvent.click(screen.getByDisplayValue("All"))
    statuses.forEach(status => screen.getByText(status))
  })
})
