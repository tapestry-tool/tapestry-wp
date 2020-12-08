import { fireEvent, waitFor } from "@testing-library/vue"
import userEvent from "@testing-library/user-event"
import { render } from "@/utils/test"
import { nodeStatus } from "@/utils/constants"
import * as Comment from "@/utils/comments"
import client from "@/services/TapestryAPI"
import * as wp from "@/services/wp"

import NodeReview from "@/components/NodeReview.vue"

jest.mock("@/services/TapestryAPI", () => {
  return {
    ...jest.requireActual("@/services/TapestryAPI"),
    reviewNode: jest.fn(),
  }
})

describe("NodeReview", () => {
  const reviewNode = {
    id: 123,
    status: nodeStatus.DRAFT,
    reviewStatus: nodeStatus.SUBMIT,
    reviewComments: [],
    author: {
      id: "2",
      name: "subscriber",
      email: "foo@bar.com",
    },
  }

  const setup = () => {
    const { status, reviewStatus, reviewComments } = reviewNode
    client.reviewNode.mockResolvedValue({
      data: { status, reviewStatus, reviewComments },
    })
    return render(NodeReview, { props: { node: reviewNode } })
  }

  const getComments = () => client.reviewNode.mock.calls[0][1]

  beforeEach(() => {
    client.reviewNode.mockReset()
  })

  it("should be able to reject a node with a comment", async () => {
    const screen = setup()
    const comment = "Looks terrible!"

    userEvent.type(screen.getByRole("textbox", { name: "comment" }), comment)
    await fireEvent.click(screen.getByRole("button", { name: /reject/i }))

    expect(screen.queryByRole("textbox", { name: "comment" })).toBeNull()
    await waitFor(() => {
      screen.getByRole("textbox", { name: "comment" })
    })

    const comments = getComments()
    expect(comments).toHaveLength(2)

    const [statusChange, commentEvent] = comments
    expect(statusChange).toEqual(
      expect.objectContaining({
        from: nodeStatus.SUBMIT,
        to: nodeStatus.REJECT,
      })
    )
    expect(commentEvent.comment).toEqual(comment)
  })

  it("should be able to accept a node", async () => {
    const screen = setup()
    await fireEvent.click(screen.getByText("Accept and Add"))

    const comments = getComments()
    expect(comments).toHaveLength(1)
    expect(comments[0]).toEqual(
      expect.objectContaining({
        from: nodeStatus.SUBMIT,
        to: nodeStatus.ACCEPT,
      })
    )
  })

  it("should be able to submit a comment as the submitter", async () => {
    wp.canEditTapestry.mockReturnValue(false)
    wp.getCurrentUser.mockReturnValue({ ...reviewNode.author })

    const screen = setup()
    expect(screen.queryByText(/accept/i)).toBeNull()

    const comment = "Pls look at my node"
    userEvent.type(screen.getByRole("textbox", { name: "comment" }), comment)
    await fireEvent.click(screen.getByText(/submit/i))

    const comments = getComments()
    expect(comments).toHaveLength(1)
    expect(comments[0]).toEqual(
      expect.objectContaining({
        type: Comment.types.COMMENT,
        comment,
      })
    )
  })

  it("should be hidden for non-participants", async () => {
    wp.canEditTapestry.mockReturnValue(false)
    wp.getCurrentUser.mockReturnValue({
      id: "3",
      name: "not-the-author",
      email: "bar@foo.com",
    })
    const screen = setup()
    expect(screen.queryByText("Review")).toBeNull()
  })
})
