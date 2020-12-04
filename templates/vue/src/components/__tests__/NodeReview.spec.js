import { fireEvent, waitFor } from "@testing-library/vue"
import userEvent from "@testing-library/user-event"
import { render } from "@/utils/test"
import { nodeStatus } from "@/utils/constants"
import client from "@/services/TapestryAPI"
import * as wp from "@/services/wp"

import NodeReview from "@/components/NodeReview.vue"

jest.mock("@/services/TapestryAPI", () => {
  return {
    ...jest.requireActual("@/services/TapestryAPI"),
    updateNode: jest.fn(),
  }
})

describe("NodeReview", () => {
  const setup = () => {
    const node = {
      id: 123,
      status: nodeStatus.DRAFT,
      reviewStatus: nodeStatus.SUBMIT,
      reviewComments: [],
      author: {
        id: "1",
        name: "admin",
        email: "foo@bar.com",
      },
    }
    client.updateNode.mockResolvedValue({ data: node })
    return render(NodeReview, { props: { node } })
  }

  const getUpdatedNode = () => JSON.parse(client.updateNode.mock.calls[0][1])

  beforeEach(() => {
    client.updateNode.mockReset()
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

    const node = getUpdatedNode()
    expect(node.reviewStatus).toEqual(nodeStatus.REJECT)
    expect(node.reviewComments.length).toEqual(2)

    const [statusChange, commentEvent] = node.reviewComments
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

    const node = getUpdatedNode()
    expect(node.reviewStatus).toEqual("accept")
    expect(node.reviewComments.length).toEqual(1)
  })

  it("should show confirmation when rejecting a node without a comment", async () => {
    const screen = setup()
    await fireEvent.click(screen.getByText("Reject"))

    screen.getByText(/reject this node without a comment/i)
    await fireEvent.click(screen.getByText(/ok/i))

    const node = getUpdatedNode()
    expect(node.reviewStatus).toEqual("reject")
    expect(node.reviewComments.length).toEqual(1)
  })

  it("should be hidden for non-participants", async () => {
    wp.canEditTapestry.mockReturnValueOnce(false)
    wp.getCurrentUser.mockReturnValueOnce({
      id: "3",
      name: "not-the-author",
      email: "bar@foo.com",
    })
    const screen = setup()
    expect(screen.queryByText("Review")).toBeNull()
  })
})
