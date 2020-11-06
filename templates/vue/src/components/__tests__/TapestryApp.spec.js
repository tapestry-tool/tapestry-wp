import { render } from "@/utils/test"
import TapestryApp from "@/components/TapestryApp.vue"
import root from "@/fixtures/root.json"

describe("TapestryApp", () => {
  it("should render the whole app", async () => {
    render(TapestryApp, { fixture: root })
  })
})
