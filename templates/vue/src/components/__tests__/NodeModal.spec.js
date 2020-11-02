import Vue from "vue"
import { fireEvent } from "@testing-library/vue"
import { render } from "@/utils/test"

import root from "@/fixtures/root.json"
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

const node = root.nodes[0]
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

describe("node modal", () => {
  let screen

  beforeEach(async () => {
    GravityFormsApi.exists.mockImplementation(() => Promise.resolve(false))
    screen = render(WrappedNodeModal, root, { mocks: mocks })
    await fireEvent.click(screen.getByText("Modal Button"))
  })

  it("should create video node for youtube video", async () => {
    const youtubeURL = "https://youtu.be/d63DL-Erz50"

    await fireEvent.change(screen.getByPlaceholderText(/title/i), {
      target: { value: "Test Title" },
    })
    await fireEvent.change(screen.getByTestId("node-mediaType"), {
      target: { value: "video" },
    })
    expect(screen.queryByText("Video")).toBeInTheDocument()
    expect(screen.queryByText("Video URL")).toBeInTheDocument()

    await fireEvent.change(screen.getByTestId("node-videoUrl"), {
      target: { value: youtubeURL },
    })
    expect(screen.getByTestId("node-videoUrl").value).toMatch(youtubeURL)

    await fireEvent.click(screen.getByText(/Publish/i))
    expect(
      screen.queryByText("Please enter a valid Video URL")
    ).not.toBeInTheDocument()
    await screen.waitForElementToBeRemoved(() => screen.queryByText("Publish"))
  })

  it("should not create video node for invalid video url", async () => {
    const fakeURL = "www.testing.com"
    await fireEvent.change(screen.getByPlaceholderText(/title/i), {
      target: { value: "Test Title" },
    })
    await fireEvent.change(screen.getByTestId("node-mediaType"), {
      target: { value: "video" },
    })
    expect(screen.queryByText("Video")).toBeInTheDocument()
    expect(screen.queryByText("Video URL")).toBeInTheDocument()

    await fireEvent.change(screen.getByTestId("node-videoUrl"), {
      target: { value: fakeURL },
    })
    expect(screen.getByTestId("node-videoUrl").value).toMatch(fakeURL)

    await fireEvent.click(screen.getByText(/Publish/i))
    expect(screen.queryByText("Please enter a valid Video URL")).toBeInTheDocument()
  })
})
