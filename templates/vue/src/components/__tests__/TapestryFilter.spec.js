import { fireEvent, waitFor, within } from "@testing-library/vue"
import userEvent from "@testing-library/user-event"
import { render as r, addNode } from "@/utils/test"
import { nodeStatus } from "@/utils/constants"
import Helpers from "@/utils/Helpers"
import TapestryFilter from "@/components/TapestryFilter.vue"
import multiAuthorTapestry from "@/fixtures/multi-author.json"
import * as wp from "@/services/wp"
import client from "@/services/TapestryAPI"
import { names } from "@/config/routes"

jest.mock("@/services/TapestryAPI", () => {
  return {
    ...jest.requireActual("@/services/TapestryAPI"),
    getAllContributors: jest.fn().mockResolvedValue(null),
    getTapestry: jest.fn(),
  }
})

const render = ({
  settings = {},
  query = {},
  fixture = multiAuthorTapestry,
} = {}) => {
  return r(
    TapestryFilter,
    {
      fixture,
      settings,
    },
    (_vm, _store, router) => {
      router.push({
        name: names.APP,
        params: { nodeId: multiAuthorTapestry.nodes[0].id },
        query,
      })
    }
  )
}

const setup = opts => {
  const screen = render(opts)
  userEvent.click(screen.getByLabelText("search"))
  return {
    ...screen,
    combobox: within(screen.getByTestId("search-input")).getByRole("combobox", {
      hidden: true,
    }),
  }
}

describe("TapestryFilter", () => {
  beforeEach(() => {
    wp.canEditTapestry.mockReturnValue(true)
  })

  it("should be able to change the filter type and have the text placeholder update", async () => {
    const screen = setup()
    userEvent.click(await screen.findByDisplayValue("Title"))

    const options = ["Title", "Author", "Status"]
    options.forEach(option => screen.getByText(option))

    userEvent.selectOptions(screen.getByDisplayValue("Title"), "Author")
    await screen.findByTestId("search-input")
  })

  it("should show dropdown of node titles if searching by title", async () => {
    const titles = multiAuthorTapestry.nodes.map(node => node.title)
    const screen = setup()

    userEvent.click(screen.combobox)
    await waitFor(() => {
      titles.forEach(title => screen.getByText(title))
    })
  })

  it("should show dropdown of authors if searching by author", async () => {
    const authors = Helpers.unique(
      multiAuthorTapestry.nodes.map(node => node.author),
      "id"
    )
    const screen = setup()

    userEvent.selectOptions(await screen.findByDisplayValue("Title"), "Author")
    userEvent.click(screen.combobox)

    await waitFor(() => {
      authors.forEach(author => screen.getByText(author.name))
    })
  })

  it("should be able to search for author by id", async () => {
    const { author } = multiAuthorTapestry.nodes[0]
    const screen = setup()

    userEvent.selectOptions(await screen.findByDisplayValue("Title"), "Author")
    userEvent.type(screen.combobox, author.id)

    await screen.findByText(author.name)
  })

  it("should show simple select if searching by status", async () => {
    const statuses = Object.values(nodeStatus)
    const screen = setup()

    userEvent.selectOptions(await screen.findByDisplayValue("Title"), "Status")
    await screen.findByTestId("status-select")

    userEvent.click(screen.getByText(/all/i))
    statuses.forEach(status => {
      if (status !== nodeStatus.REJECT) {
        screen.getByText(new RegExp(status, "i"))
      }
    })
    expect(screen.queryByText(new RegExp(nodeStatus.REJECT, "i"))).toBeNull()
  })

  it("should reset value if search type is changed", async () => {
    const screen = setup()

    userEvent.selectOptions(await screen.findByDisplayValue("Title"), "Author")
    userEvent.click(screen.combobox)
    userEvent.click(await screen.findByText("admin"))

    userEvent.selectOptions(screen.getByDisplayValue("Author"), "Title")
    await screen.findByDisplayValue("")
  })

  it("should reset value to 'All' if search type is changed to status", async () => {
    const screen = setup()

    userEvent.selectOptions(await screen.findByDisplayValue("Title"), "Author")
    userEvent.click(screen.combobox)
    userEvent.click(await screen.findByText("admin"))

    userEvent.selectOptions(screen.getByDisplayValue("Author"), "Status")
    await screen.findByText(/all/i)
  })

  it("should show loading indicator when superuser override is off", async () => {
    client.getTapestry.mockResolvedValue(multiAuthorTapestry)
    const screen = setup({ settings: { superuserOverridePermissions: false } })

    userEvent.selectOptions(await screen.findByDisplayValue("Title"), "Author")
    userEvent.click(screen.combobox)
    userEvent.click(await screen.findByText("admin"))

    await screen.findByTestId("search-loading")
    await waitFor(() => {
      expect(screen.queryByTestId("search-loading")).toBeNull()
    })
  })

  it("should hide the author option for unauthorized users", async () => {
    wp.canEditTapestry.mockReturnValue(false)
    const screen = setup()

    await fireEvent.click(await screen.findByDisplayValue("Title"))
    expect(screen.queryByRole("option", { name: /author/i })).toBeNull()
  })

  it("should show the search bar with the correct type if the user visits the url", async () => {
    const screen = render({ query: { search: "Title" } })
    expect(await screen.findByDisplayValue("Title")).toBeVisible()
  })

  it("should populate the value with the query in the url", async () => {
    const { author } = multiAuthorTapestry.nodes[0]
    const screen = render({ query: { search: "Author", query: author.name } })
    const filter = within(screen.getByTestId("tapestry-filter"))
    expect(await filter.findByText(author.name)).toBeVisible()
  })

  it("should not show the author option if an unauthorized user visits the url", async () => {
    wp.canEditTapestry.mockReturnValue(false)
    const screen = render({ query: { search: "Author" } })
    screen.getByDisplayValue("Title")
  })

  it("should be able to search for nodes with non-unique titles", async () => {
    const { title, id } = multiAuthorTapestry.nodes[0]
    const fixture = addNode(multiAuthorTapestry, id, { title })

    const screen = setup({ fixture })
    userEvent.type(screen.combobox, title)
    await waitFor(() => {
      expect(screen.getAllByText(title)).toHaveLength(2)
    })
  })

  it("should show the rejected option if the show rejected setting is true", async () => {
    const screen = setup({ settings: { showRejected: true } })

    userEvent.selectOptions(await screen.findByDisplayValue("Title"), "Status")
    await screen.findByTestId("status-select")

    userEvent.click(screen.getByText(/all/i))
    screen.getByText(new RegExp(nodeStatus.REJECT, "i"))
  })
})
