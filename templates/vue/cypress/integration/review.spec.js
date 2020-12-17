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
      cy.getNodeById(node.id).click({ force: true })
      cy.getByTestId(`edit-node-${node.id}`).should("not.exist")
    })

    cy.findByLabelText("open sidebar").click()
    cy.sidebar().within(() => {
      cy.findByText(/submitted this node for review/i).should("be.visible")
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
          cy.contains(/accepted this node/i).should("be.visible")

          // hide the review form once accepted
          cy.findByRole("textbox", { name: /comment/i }).should("not.be.visible")
        })
    })

    cy.logout().visitTapestry()
    cy.contains(node.title).should("exist")
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
          cy.findByRole("textbox", { name: /comment/i }).type(comment)
          cy.contains(/reject/i).click()
          cy.contains(/reject/i).should("be.hidden")
          cy.contains(/rejected this node/i).should("be.visible")
          cy.contains(comment).should("be.visible")
          cy.findByRole("textbox", { name: /comment/i }).should("not.be.visible")
        })
      cy.getNodeById(node.id).should("not.be.visible")
    })

    cy.logout().visitTapestry()

    cy.getNodeByTitle(node.title).should("be.null")

    cy.login(roles.SUBSCRIBER).visitTapestry()
    cy.getNodeByTitle(node.title).then(node => {
      cy.getNodeById(node.id).click()
      cy.findByLabelText("open sidebar").click()
      cy.sidebar().within(() => {
        cy.contains(/resubmit/i).should("be.visible")
      })
    })
  })

  it("should be able to leave comments as the submitter", () => {
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
    cy.findByLabelText("open sidebar").click()
    cy.findByRole("textbox", { name: /comment/i }).type(comment)
    cy.sidebar()
      .contains(/add comment/i)
      .click()

    cy.findByRole("textbox", { name: /comment/i }).should("be.hidden")
    cy.sidebar()
      .contains(comment)
      .should("be.visible")
  })
})
