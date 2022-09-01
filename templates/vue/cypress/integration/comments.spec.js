import { roles } from "../support/roles"

describe("Comments", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
  })

  it("should be able to add and delete comments to a node as admin", () => {
    cy.setup("@oneNode", roles.ADMIN)

    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const rootId = Object.keys(nodes)[0]
        cy.getNodeById(rootId).click()

        const first = "Good job!"
        const second = "Please keep doing this!"
        cy.openSidebar().within(() => {
          cy.contains(/add comment/i).click()
          cy.getByTestId("comment-textarea").type(first)
          cy.contains(/post comment/i).click()

          cy.getByTestId("comment-textarea").should("not.exist")
          cy.contains(first).should("be.visible")

          cy.contains(/add comment/i).click()
          cy.getByTestId("comment-textarea").type(second)
          cy.contains(/post comment/i).click()

          cy.getByTestId("comment-textarea").should("not.exist")
          cy.contains(second).should("be.visible")

          // delete the first comment
          clickCommentAction(first, /trash/i)
          cy.contains(first).should("not.exist")
        })

        cy.logout().visitTapestry()

        cy.getNodeById(rootId).click()

        cy.openSidebar().within(() => {
          cy.contains(first).should("not.exist")
          cy.contains(second).should("be.visible")

          // check that logged out users cannot add or perform actions to a comment
          cy.contains(/add comment/i).should("not.exist")
          cy.contains(second)
            .parent(".comment")
            .find(".comment-action-btn")
            .should("not.exist")
        })
      })
  })

  it("should be able to add and delete comments to a node as subscriber", () => {
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

          clickCommentAction(comment, /trash/i)
          cy.contains(comment).should("not.exist")
        })
      })
  })

  it("should be able to approve and unapprove a comment as admin", () => {
    cy.setup("@oneNode", roles.ADMIN)

    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const rootId = Object.keys(nodes)[0]
        cy.getNodeById(rootId).click()

        const comment = "A pending comment."
        cy.openSidebar().within(() => {
          cy.contains(/add comment/i).click()
          cy.getByTestId("comment-textarea").type(comment)
          cy.contains(/post comment/i).click()

          cy.getByTestId("comment-textarea").should("not.exist")
          cy.contains(comment).should("be.visible")
          cy.contains(/held for moderation/i).should("not.exist")

          clickCommentAction(comment, /unapprove/i)

          cy.contains(comment).should("be.visible")
          cy.contains(/held for moderation/i).should("be.visible")
        })

        cy.logout().visitTapestry()

        cy.getNodeById(rootId).click()
        cy.openSidebar().within(() => {
          cy.contains(comment).should("not.exist")
        })

        cy.logout()
        cy.login(roles.ADMIN).visitTapestry()

        cy.openSidebar().within(() => {
          clickCommentAction(comment, /approve/i)
          cy.contains(comment).should("be.visible")
          cy.contains(/held for moderation/i).should("not.exist")
        })
      })
  })

  it("should not be able to see the Comments section for a draft node", () => {
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

function clickCommentAction(comment, action) {
  cy.contains(comment)
    .parent(".comment")
    .within(() => {
      cy.get(".comment-action-btn").then($el => {
        if ($el.hasClass("comment-action-dropdown")) {
          cy.wrap($el).click({ force: true })
          cy.contains(action).click()
        } else {
          cy.wrap($el).click({ force: true })
        }
      })
    })
}
