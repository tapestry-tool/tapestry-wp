import { fireEvent, waitFor } from "@testing-library/vue"
import userEvent from "@testing-library/user-event"
import { render } from "@/utils/test"
import ReviewForm from "@/components/ReviewForm.vue"
import { getCurrentUser } from "@/services/wp"

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

  it("should be able to reject a node with a comment", async () => {
    const [node, screen] = setup()
    const comment = "Looks terrible!"

    userEvent.type(screen.getByRole("textbox", { name: "comment" }), comment)
    userEvent.click(screen.getByRole("button", { name: /reject/i }))

    expect(node.reviewStatus).toEqual("reject")
    expect(node.reviewComments.length).toEqual(1)
    expect(node.reviewComments[0].comment).toEqual(comment)
  })

  it("should be able to accept a node", async () => {
    const [node, screen] = setup()
    await fireEvent.click(screen.getByText("Accept and Add"))

    expect(node.reviewStatus).toEqual("accept")
    expect(node.reviewComments.length).toEqual(0)
  })

  it("should show confirmation when rejecting a node without a comment", async () => {
    const [node, screen] = setup()
    userEvent.click(screen.getByText("Reject"))

    await screen.findByText(/reject this node without a comment/i)
    expect(node.reviewStatus).toBeUndefined()

    userEvent.click(screen.getByText(/ok/i))
    await waitFor(() => {
      expect(node.reviewStatus).toEqual("reject")
      expect(node.reviewComments.length).toEqual(0)
    })
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
