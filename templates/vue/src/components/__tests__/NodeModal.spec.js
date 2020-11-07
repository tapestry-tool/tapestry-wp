import Vue from "vue"
import { fireEvent } from "@testing-library/vue"
import { render } from "@/utils/test"

import oneNodeTapestry from "@/fixtures/one-node.json"
import NodeModal from "@/components/NodeModal.vue"
import GravityFormsApi from "@/services/GravityFormsApi"
import routes, { names } from "@/config/routes"

// Wrapper to add button to trigger NodeModal, otherwise, does not render with visible
const WrappedNodeModal = Vue.component("wrapped-node-modal", {
  components: {
    NodeModal,
  },
  template: `<div>
    <b-button v-b-modal.node-modal>Modal Button</b-button>
    <node-modal/>
  </div>`,
})

jest.mock("@/services/GravityFormsApi", () => {
  return {
    ...jest.requireActual("@/services/GravityFormsApi"),
    exists: jest.fn(),
    getAllForms: jest.fn(),
  }
})

const node = oneNodeTapestry.nodes[0]
const route = {
  name: names.MODAL,
  path: `/nodes/${node.id}`,
  params: {
    nodeId: node.id,
    type: "add",
    tab: "content",
  },
}
const mocks = {
  $router: [routes.modal],
  $route: route,
}

describe("node modal: content - video", () => {
  let screen

  beforeEach(async () => {
    GravityFormsApi.exists.mockImplementation(() => Promise.resolve(false))
    screen = render(WrappedNodeModal, oneNodeTapestry, { mocks: mocks })
    await fireEvent.click(screen.getByText("Modal Button"))
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

  it("Should show an error and not create a node if an mp4 URL is invalid", async () => {
    await fireEvent.update(screen.getByPlaceholderText(/title/i), "Test Title")
    await fireEvent.change(screen.getByTestId("node-media-type"), {
      target: { value: "video" },
    })
    expect(screen.queryByText("Video URL")).toBeInTheDocument()
    const url = "www.example.com/video.mp4"
    await fireEvent.update(screen.getByTestId("node-video-url"), url)
    expect(screen.getByTestId("node-video-url").value).toMatch(url)
    await fireEvent.click(screen.getByText(/Publish/i))
    // TODO: this fails - might need an e2e test since this involves the backend upload?
    const errMsg = "Invalid mp4 Video URL: please re-upload or check the URL"
    expect(screen.queryByText(errMsg)).toBeInTheDocument()
  })
  // TODO: write test for API error handle
})
