import { fireEvent } from "@testing-library/vue"
import { render } from "@/utils/test"
import ReviewForm from "@/components/node-modal/ReviewForm.vue"

/**
 * Have to skip comment tests here because there's no way to edit `contenteditable`
 * elements (i.e. the RichTextForm) using Jest.
 * See:
 *  - https://github.com/jsdom/jsdom/issues/1670
 */
describe("ReviewForm", () => {
  const getMockNode = () => {
    return {
      status: "draft",
      author: {
        id: "1",
        name: "John",
      },
      comments: [],
    }
  }

  it("should be able to reject a node", async () => {
    const node = getMockNode()

    const screen = render(ReviewForm, null, { props: { node } })

    await fireEvent.click(screen.getByText("Reject Node"))

    expect(node.status).toEqual("reject")
    expect(node.comments.length).toEqual(0)
  })

  it("should be able to accept a node", async () => {
    const node = getMockNode()

    const screen = render(ReviewForm, null, { props: { node } })
    await fireEvent.click(screen.getByText("Accept Node"))

    expect(node.status).toEqual("publish")
    expect(node.comments.length).toEqual(0)
  })
})
