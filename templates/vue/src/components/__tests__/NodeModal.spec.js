import { fireEvent } from "@testing-library/vue"
import { render } from "@/utils/test"

import oneNodeTapestry from "@/fixtures/one-node.json"
import NodeModal from "@/components/NodeModal.vue"
import GravityFormsApi from "@/services/GravityFormsApi"
import { names } from "@/config/routes"

const node = oneNodeTapestry.nodes[0]

jest.mock("@/services/GravityFormsApi", () => {
  return {
    ...jest.requireActual("@/services/GravityFormsApi"),
    exists: jest.fn(),
    getAllForms: jest.fn(),
  }
})

describe("node modal: content - video", () => {
  let screen

  beforeEach(async () => {
    GravityFormsApi.exists.mockImplementation(() => Promise.resolve(false))
    screen = render(
      NodeModal,
      { fixture: oneNodeTapestry },
      (_vueInstance, _vuexStore, router) => {
        router.push({
          name: names.MODAL,
          params: { nodeId: node.id, type: "add", tab: "content" },
        })
      }
    )
  })

  async function testVideoSetup(screen, url) {
    await fireEvent.update(screen.getByPlaceholderText(/title/i), "Test Title")
    await fireEvent.change(screen.getByTestId("node-media-type"), {
      target: { value: "video" },
    })
    expect(screen.queryByText("Video")).toBeInTheDocument()
    expect(screen.queryByText("Video URL")).toBeInTheDocument()

    await fireEvent.update(screen.getByTestId("node-video-url"), url)
    expect(screen.getByTestId("node-video-url").value).toMatch(url)

    await fireEvent.click(screen.getByText(/Publish/i))
  }

  it("should create video node for youtube video", async () => {
    const youtubeURL = "https://youtu.be/d63DL-Erz50"
    await testVideoSetup(screen, youtubeURL)
    expect(
      screen.queryByText("Please enter a valid Video URL")
    ).not.toBeInTheDocument()
  })

  it("should not create video node for invalid video url", async () => {
    const fakeURL = "www.testing.com"
    await testVideoSetup(screen, fakeURL)
    expect(screen.queryByText("Please enter a valid Video URL")).toBeInTheDocument()
  })
})
