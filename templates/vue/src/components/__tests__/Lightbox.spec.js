import { render } from "@/utils/test"
import Lightbox from "@/components/Lightbox.vue"
import root from "@/fixtures/root.json"

describe("lightbox", () => {
  it("should render a text lightbox", async () => {
    const node = root.nodes[0]

    const screen = render(Lightbox, { fixture: root, props: { nodeId: node.id } })
    await screen.findByText(node.typeData.textContent)
  })
})
