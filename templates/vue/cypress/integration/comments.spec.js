import { roles } from "../support/roles"

describe("Comments", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
  })

  it("should be able to post comments to a node as a logged in user", () => {
    cy.setup("@oneNode", roles.SUBSCRIBER)

    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const rootId = Object.keys(nodes)[0]
        cy.getNodeById(rootId).click()

        const comment = "This looks great!"
        cy.openSidebar().within(() => {
          cy.contains(/add comment/i).click()
          cy.getByTestId("comment-textarea").type(comment)
          cy.contains(/post comment/i).click()

          cy.getByTestId("comment-textarea").should("not.exist")
          cy.contains(comment).should("be.visible")
        })

        cy.logout().visitTapestry()

        cy.getNodeById(rootId).click()

        cy.openSidebar().within(() => {
          cy.contains(/add comment/i).should("not.exist")
          cy.contains(comment).should("be.visible")
        })
      })
  })

  it("should not see the Comments section for a draft node", () => {
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
      cy.getNodeById(node.id).click()

      cy.openSidebar().within(() => {
        cy.contains(/submitted/i).should("be.visible")
        cy.contains(/comments/i).should("not.exist")
      })
    })

    cy.logout()
    cy.login(roles.ADMIN).visitTapestry()

    cy.getNodeByTitle(node.title).then(node => {
      cy.getNodeById(node.id).click()
      cy.openSidebar().within(() => {
        cy.contains(/comments/i).should("not.exist")
        cy.contains(/accept/i).click()
        cy.contains(/accept/i).should("be.hidden")
        cy.contains(/accepted/i).should("be.visible")
        cy.getByTestId("review-comment-textarea").should("not.exist")
        cy.contains(/comments/i).should("be.visible")
        cy.contains(/add comment/i).should("be.visible")
      })
    })
  })
})
