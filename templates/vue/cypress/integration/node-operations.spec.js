import { setup } from "../support/utils"

describe("Node Operations", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    setup("@oneNode")
  })

  it(`
    Given: A Tapestry node and its author
    When: The tapestry loads
    Then: Its add, edit, and media buttons should be visible and clickable
  `, () => {
    cy.getSelectedNode().then(({ id }) => {
      cy.getByTestId(`add-node-${id}`).click()
      cy.getByTestId("node-modal").should("be.visible")
      cy.contains(/cancel/i).click()

      cy.getByTestId(`edit-node-${id}`).click()
      cy.getByTestId("node-modal").should("be.visible")
      cy.contains(/cancel/i).click()

      cy.getByTestId(`open-node-${id}`).click()
      cy.getByTestId("lightbox").should("be.visible")
    })
  })

  it(`
    Given: A Tapestry node that does not have a media button
    When: The node is clicked
    Then: Its lightbox should be visible
  `, () => {
    cy.getSelectedNode().then(node => {
      cy.wrap(node).editNodeInStore({
        hideMedia: true,
      })
      cy.getByTestId(`node-${node.id}`).click()
      cy.getByTestId("lightbox").should("be.visible")
    })
  })
})
