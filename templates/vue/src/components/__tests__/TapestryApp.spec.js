import { render } from "@/utils/test"
import TapestryApp from "@/components/TapestryApp.vue"
import oneNodeTapestry from "@/fixtures/one-node.json"

describe("TapestryApp", () => {
  it("should render the whole app", () => {
    render(TapestryApp, { fixture: oneNodeTapestry })
  })
})
