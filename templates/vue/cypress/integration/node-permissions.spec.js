import { setup as setupTapestry } from "../support/utils"

describe("Node Permissions", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    setupTapestry("@oneNode")
  })

  const setup = edits => {
    cy.getSelectedNode().editNode({ permissions: edits })
  }

  it(`
    Given: A user without any read permissions
    When: The Tapestry loads
    Then: The empty Tapestry text should be shown
  `, () => {
    setup({
      public: [],
    })
    cy.logout().visitTapestry()
    cy.contains(/is empty/i).should("exist")
  })

  it(`
    Given: A node and a user without edit permission
    When: The Tapestry loads
    Then: The edit button should not exist
  `, () => {
    setup({
      public: ["read"],
      authenticated: ["read", "edit"],
    })
    cy.getSelectedNode().then(node => {
      cy.logout().visitTapestry()
      cy.getByTestId(`edit-node-${node.id}`).should("not.exist")

      cy.login("subscriber").visitTapestry()
      cy.getByTestId(`edit-node-${node.id}`).should("exist")
    })
  })

  it(`
    Given: A node and a user without add permission
    When: The Tapestry loads
    Then: The add button should not exist
  `, () => {
    setup({
      public: ["read"],
      authenticated: ["read", "add"],
    })
    cy.getSelectedNode().then(node => {
      cy.logout().visitTapestry()
      cy.getByTestId(`add-node-${node.id}`).should("not.exist")

      cy.login("subscriber").visitTapestry()
      cy.getByTestId(`add-node-${node.id}`).should("exist")
    })
  })
})
