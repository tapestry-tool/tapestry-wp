import { fireEvent } from "@testing-library/vue"
import { render } from "@/utils/test"
import ReviewForm from "@/components/node-modal/ReviewForm.vue"
import { getCurrentUser } from "@/services/wp"

/**
 * Have to skip comment tests here because there's no way to edit `contenteditable`
 * elements (i.e. the RichTextForm) using Jest.
 * See:
 *  - https://github.com/jsdom/jsdom/issues/1670
 */
describe("ReviewForm", () => {
  const setup = () => {
    const node = {
      status: "draft",
      author: {
        id: "1",
        name: "John",
      },
      reviewComments: [],
    }
    return [node, render(ReviewForm, { props: { node } })]
  }

  it("should be able to reject a node", async () => {
    const [node, screen] = setup()
    await fireEvent.click(screen.getByText("Reject"))

    expect(node.status).toEqual("reject")
    expect(node.reviewComments.length).toEqual(0)
  })

  it("should be able to accept a node", async () => {
    const [node, screen] = setup()
    await fireEvent.click(screen.getByText("Accept and Add"))

    expect(node.reviewStatus).toEqual("accept")
    expect(node.reviewComments.length).toEqual(0)
  })

  it("should maintain the original author", async () => {
    // Set the current user to something different than the author
    getCurrentUser.mockReturnValueOnce({
      id: "2",
      name: "reviewer",
      email: "foo@bar.com",
    })

    const [node, screen] = setup()
    const originalAuthor = { ...node.author }

    await fireEvent.click(screen.getByText("Accept and Add"))

    expect(node.author.id).toEqual(originalAuthor.id)
  })
})
