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

describe("node modal: TYDE", () => {
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

  async function setTydeType(type) {
    const selector = screen.getByTestId("tyde-node-type")
    await fireEvent.update(selector, type)
  }

  it("should provide the correct form for a regular node", async () => {
    await fireEvent.update(screen.getByPlaceholderText(/title/i), "Regular Node")
    await setTydeType("Regular")
    await fireEvent.change(screen.getByTestId("node-media-type"), {
      target: { value: "text" },
    })
    expect(screen.queryByTestId("node-text-content")).toBeInTheDocument()

    expect(screen.queryByText("Appearance")).toBeInTheDocument()
    expect(screen.queryByText("Access")).toBeInTheDocument()
    expect(screen.queryByText("More Information")).toBeInTheDocument()

    expect(screen.queryByText("Spaceship Part")).not.toBeInTheDocument()
    expect(screen.queryByText("Ordering")).not.toBeInTheDocument()
  })

  it("should provide the correct form for a module node", async () => {
    await fireEvent.update(screen.getByPlaceholderText(/title/i), "Module Node")
    await setTydeType("Module")
    await fireEvent.change(screen.getByTestId("node-media-type"), {
      target: { value: "text" },
    })
    expect(screen.queryByTestId("node-text-content")).toBeInTheDocument()

    expect(screen.queryByText("Appearance")).toBeInTheDocument()
    expect(screen.queryByText("Access")).toBeInTheDocument()
    expect(screen.queryByText("More Information")).toBeInTheDocument()

    expect(screen.queryByText("Spaceship Part")).toBeInTheDocument()
    expect(screen.queryByText("Ordering")).toBeInTheDocument()

  })
})
