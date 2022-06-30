import { render } from "@/utils/test"
import PageMenu from "./PageMenu"
import pageTapestry from "@/fixtures/deep-page.json"

describe("PageMenu", () => {
  beforeEach(() => {
    // https://stackoverflow.com/questions/44249985/js-testing-code-that-uses-an-intersectionobserver
    // IntersectionObserver isn't available in test environment
    const mockIntersectionObserver = jest.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    })
    window.IntersectionObserver = mockIntersectionObserver
  })

  it("should render page navigation bar with all children names on full screen", async () => {
    const node = pageTapestry.nodes[0]
    const childNames = pageTapestry.nodes
      .slice(1, pageTapestry.nodes.length)
      .map(node => node.title)
    const screen = render(PageMenu, {
      fixture: pageTapestry,
      props: {
        node: node,
        dimensions: {
          height: 800,
          width: 900,
        },
        pages: false,
        activePageIndex: 0,
      },
    })
    for (const childName of childNames) {
      await screen.findByText(childName)
    }
  })

  it("should render burger menu if browser width too small", async () => {
    // Set viewport
    global.innerWidth = 500
    global.dispatchEvent(new Event("resize"))

    const node = pageTapestry.nodes[0]
    const screen = render(PageMenu, {
      fixture: pageTapestry,
      props: {
        node: node,
        dimensions: {
          height: 800,
          width: 500,
        },
        pages: false,
        activePageIndex: 0,
      },
    })
    await screen.findByTestId("page-nav-toggle")
  })
})
