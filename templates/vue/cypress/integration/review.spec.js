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
      cy.openModal("edit", node.id)
      cy.contains(/accept/i).click()
      cy.getByTestId("node-modal", { timeout: 10000 }).should("not.be.visible")
    })

    cy.logout().visitTapestry()
    cy.getNodeByTitle(node.title).should("not.be.null")
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

    cy.getNodeByTitle(node.title).then(node => {
      cy.openModal("edit", node.id)

      cy.getEditable("review-comment").type("Looks terrible!")

      cy.contains(/reject/i).click()
      cy.getByTestId("node-modal", { timeout: 10000 }).should("not.be.visible")

      cy.getNodeById(node.id).should("not.be.visible")
    })

    // TODO: Add checks for comment (waiting on #712)
  })
})
