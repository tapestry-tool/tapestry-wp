import { render } from "@/utils/test"
import PageNavigationBar from "./PageNavigationBar"
import pageTapestry from "@/fixtures/deep-page.json"

describe("PageNavigationBar", () => {
  it("should render page navigation bar with all children names on full screen", async () => {
    const node = pageTapestry.nodes[0]
    const childNames = pageTapestry.nodes
      .slice(1, pageTapestry.nodes.length)
      .map(node => node.title)
    const screen = render(PageNavigationBar, {
      fixture: pageTapestry,
      props: {
        node: node,
        parentRefs: { rowRefs: null },
        dimensions: {
          height: 800,
          width: 900,
        },
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
    const screen = render(PageNavigationBar, {
      fixture: pageTapestry,
      props: {
        node: node,
        parentRefs: { rowRefs: null },
        dimensions: {
          height: 800,
          width: 500,
        },
      },
    })
    await screen.findByTestId("page-nav-toggle")
  })
})
