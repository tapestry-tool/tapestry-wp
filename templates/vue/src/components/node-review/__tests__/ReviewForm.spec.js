import { fireEvent, waitFor } from "@testing-library/vue"
import userEvent from "@testing-library/user-event"
import { render } from "@/utils/test"

import ReviewForm from "../ReviewForm.vue"

describe("ReviewForm", () => {
  it("should be able to reject a node with a comment", async () => {
    const screen = render(ReviewForm)
    const comment = "Looks terrible!"

    userEvent.type(screen.getByRole("textbox", { name: "comment" }), comment)
    userEvent.click(screen.getByRole("button", { name: /reject/i }))

    const node = screen.emitted().submit[0][0]
    expect(node.reviewStatus).toEqual("reject")
    expect(node.reviewComments.length).toEqual(2)

    const [statusChange, commentEvent] = node.reviewComments
    expect(statusChange).toEqual(
      expect.objectContaining({
        from: "submit",
        to: "reject",
      })
    )
    expect(commentEvent.comment).toEqual(comment)
  })

  it("should be able to accept a node", async () => {
    const screen = render(ReviewForm)
    await fireEvent.click(screen.getByText("Accept and Add"))

    const node = screen.emitted().submit[0][0]
    expect(node.reviewStatus).toEqual("accept")
    expect(node.reviewComments.length).toEqual(1)
  })

  it("should show confirmation when rejecting a node without a comment", async () => {
    const screen = render(ReviewForm)
    userEvent.click(screen.getByText("Reject"))

    await screen.findByText(/reject this node without a comment/i)
    userEvent.click(screen.getByText(/ok/i))

    await waitFor(() => {
      const node = screen.emitted().submit[0][0]
      expect(node.reviewStatus).toEqual("reject")
      expect(node.reviewComments.length).toEqual(1)
    })
  })
})
