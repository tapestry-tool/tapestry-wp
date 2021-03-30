import { render } from "@/utils/test"

import oneNodeTapestry from "@/fixtures/one-node.json"
import TapestryNode from "./TapestryNode"
import { nodeStatus } from "@/utils/constants"

const node = oneNodeTapestry.nodes[0]
node.reviewStatus = nodeStatus.ACCEPT
node.status = nodeStatus.PUBLISH

describe("Tapestry node", () => {
  describe.only("Accepted nodes", () => {
    const renderAcceptedNode = (settings = {}) => {
      return render(TapestryNode, {
        fixture: oneNodeTapestry,
        props: {
          node: node,
          root: true,
        },
        settings: settings,
      })
    }

    it("should render status bar when settings enabled", async () => {
      const screen = renderAcceptedNode({ showAcceptedHighlight: true })
      const statusBarCircle = screen.getByTestId(`node-status-${node.id}`)
        .firstElementChild
      expect(statusBarCircle).toHaveAttribute("stroke", "#5CE601")
    })

    it("should not render status bar when settings disabled", async () => {
      const screen = renderAcceptedNode({ showAcceptedHighlight: false })
      const statusBarCircle = screen.getByTestId(`node-status-${node.id}`)
        .firstElementChild
      expect(statusBarCircle).toHaveAttribute("stroke", "none")
    })
  })
})
