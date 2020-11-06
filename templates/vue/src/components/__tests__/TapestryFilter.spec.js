import { render } from "@/utils/test"
import TapestryFilter from "@/components/TapestryFilter.vue"
import multiAuthorTapestry from "@/fixtures/multi-author.json"

describe("TapestryFilter", () => {
  // temp test so linter doesn't complain
  it("should render", () => {
    render(TapestryFilter, {
      fixture: multiAuthorTapestry,
    })
  })

  it.todo(
    "should be able to change the filter type and have the text placeholder update"
  )

  it.todo("should not show dropdown if searching by title")

  it.todo("should show dropdown of all authors if searching by author")

  it.todo("should show simple select if searching by status")
})
