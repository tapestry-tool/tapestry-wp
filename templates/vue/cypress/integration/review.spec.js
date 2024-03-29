import { roles } from "../support/roles"

describe("Review Nodes", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
    cy.fixture("review.json").as("review")
  })

  it("should be able to submit a node and have it be accepted", () => {
    cy.setup("@oneNode", roles.SUBSCRIBER)
    const node = {
      title: "For Review",
      mediaType: "text",
    }

    cy.getSelectedNode().then(root => {
      cy.getByTestId(`add-node-${root.id}`).click()
      cy.getByTestId(`node-title`).type(node.title)
      cy.submitModal()
    })

    cy.getNodeByTitle(node.title).then(node => {
      cy.getNodeById(node.id).click({ force: true })
      cy.getByTestId(`edit-node-${node.id}`).should("not.exist")
    })

    cy.openSidebar().within(() => {
      cy.findByText(/submitted/i).should("be.visible")
    })

    cy.logout().visitTapestry()

    cy.getNodeByTitle(node.title).should("be.null")

    cy.login(roles.ADMIN).visitTapestry()

    cy.getNodeByTitle(node.title).then(node => {
      cy.getByTestId(`review-node-${node.id}`).click()
      cy.getByTestId("sidebar-content")
        .should("be.visible")
        .within(() => {
          cy.findByLabelText("edit node").should("not.exist")
          cy.contains(/accept/i).click()
          cy.contains(/accept/i).should("be.hidden")
          cy.contains(/accepted/i).should("be.visible")

          // hide the review form once accepted
          cy.getByTestId("review-comment-textarea").should("not.exist")
        })
    })

    cy.logout().visitTapestry()
    cy.contains(node.title).should("exist")
  })

  it("should not be able to accept a child node of a submitted node", () => {
    cy.setup("@review")
    const node = {
      title: "Review Child",
      status: "draft",
      reviewStatus: "submitted",
    }
    cy.getNodeByTitle(node.title).then(node => {
      cy.getByTestId(`review-node-${node.id}`).click()
      cy.getByTestId("sidebar-content")
        .should("be.visible")
        .within(() => {
          cy.findByLabelText("edit node").should("not.exist")
          cy.contains(/accept/i).should("be.disabled")
          cy.contains(/can only be added/).should("exist")
        })
      cy.getByTestId(`review-node-${node.id}`).should("exist")
    })
  })

  it("should be able to reject a node with a comment", () => {
    cy.setup("@oneNode", roles.SUBSCRIBER)
    const node = {
      title: "For Review",
      mediaType: "text",
      status: "draft",
      reviewStatus: "submitted",
    }

    cy.getSelectedNode().then(root => {
      cy.addNode(root.id, node)
    })

    cy.login(roles.ADMIN).visitTapestry()

    const comment = "Looks terrible!"

    cy.getNodeByTitle(node.title).then(node => {
      cy.getByTestId(`review-node-${node.id}`).click()
      cy.getByTestId("sidebar-content")
        .should("be.visible")
        .within(() => {
          cy.getByTestId("review-comment-textarea").type(comment)
          cy.contains(/reject/i).click()
          cy.contains(/reject/i).should("be.hidden")
          cy.contains(/rejected/i).should("be.visible")
          cy.contains(comment).should("be.visible")
          cy.getByTestId("review-comment-textarea").should("not.exist")
        })
      cy.getNodeById(node.id).should("not.be.visible")
    })

    cy.logout().visitTapestry()

    cy.getNodeByTitle(node.title).should("be.null")

    cy.login(roles.SUBSCRIBER).visitTapestry()
    cy.getNodeByTitle(node.title).then(node => {
      cy.getNodeById(node.id).click()
      cy.openSidebar().within(() => {
        cy.contains(/resubmit/i).should("be.visible")
      })
    })
  })

  it("should be able to leave comments as the submitter", () => {
    cy.setup("@oneNode", roles.SUBSCRIBER)
    const node = {
      title: "For Review",
      mediaType: "text",
      typeData: {
        textContent: "Abcd",
      },
      status: "draft",
      reviewStatus: "submitted",
    }

    cy.getSelectedNode().then(root => {
      cy.addNode(root.id, node)
    })

    cy.getNodeByTitle(node.title).then(node => {
      cy.getNodeById(node.id).click({ force: true })
    })

    const comment = "This is my best work!"
    cy.openSidebar().within(() => {
      cy.getByTestId("review-comment-textarea").type(comment)
      cy.getByTestId("submit-review-comment").click()

      cy.getByTestId("review-comment-textarea").should("be.hidden")
      cy.contains(comment).should("be.visible")
    })
  })
})
