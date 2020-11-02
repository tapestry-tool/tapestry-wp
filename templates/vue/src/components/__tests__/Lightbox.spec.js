import { render } from "@/utils/test"
import Lightbox from "@/components/Lightbox.vue"
import oneNodeTapestry from "@/fixtures/one-node.json"

describe("lightbox", () => {
  it("should render a text lightbox", async () => {
    const node = oneNodeTapestry.nodes[0]

    const screen = render(Lightbox, oneNodeTapestry, { props: { nodeId: node.id } })
    await screen.findByText(node.typeData.textContent)
  })
})
