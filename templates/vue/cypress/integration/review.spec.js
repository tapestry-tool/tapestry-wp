import { roles } from "../support/roles"

describe("Review Nodes", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode", roles.SUBSCRIBER)
  })

  it("should be able to submit a node and have it be accepted", () => {
    const node = {
      title: "For Review",
      mediaType: "text",
      textContent: "Abcd",
    }

    cy.getSelectedNode().then(root => {
      cy.getByTestId(`add-node-${root.id}`).click()
      cy.getByTestId(`node-title`).type(node.title)
      cy.getEditable(`node-text-content`).type(node.textContent)
      cy.submitModal()
    })

    cy.getNodeByTitle(node.title).then(node => {
      cy.getNodeById(node.id).click()
      cy.getByTestId(`edit-node-${node.id}`).should("not.exist")
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
          cy.contains(/submitting review/i).should("be.visible")
          cy.contains(/admin accepted this node/i).should("be.visible")
        })
    })

    cy.logout().visitTapestry()
    cy.contains(node.title)
      .should("be.visible")
      .click()
    cy.findByLabelText("review node").should("not.exist")
  })

  it("should be able to reject a node with a comment", () => {
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

    cy.login(roles.ADMIN).visitTapestry()

    const comment = "Looks terrible!"

    cy.getNodeByTitle(node.title).then(node => {
      cy.getByTestId(`review-node-${node.id}`).click()
      cy.getByTestId("sidebar-content")
        .should("be.visible")
        .within(() => {
          cy.getEditable("review-comment").type(comment)
          cy.contains(/reject/i).click()
          cy.contains(/submitting review/i).should("be.visible")
          cy.contains(/review submitted/i).should("be.visible")
        })

      cy.getNodeById(node.id).should("not.be.visible")
    })

    cy.logout().visitTapestry()

    cy.getNodeByTitle(node.title).should("be.null")

    cy.login(roles.SUBSCRIBER).visitTapestry()
    cy.getNodeByTitle(node.title).then(node => {
      cy.getNodeById(node.id).click()
      cy.findByLabelText("review node").click()
      cy.contains(/admin rejected this node/i).should("be.visible")
      cy.contains(comment).should("be.visible")
      cy.contains(/resubmit/i).should("be.visible")
    })
  })
})
