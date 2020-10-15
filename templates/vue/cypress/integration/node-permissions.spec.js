describe("Node Permissions", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    cy.setup("@oneNode")
  })

  it(`
    Given: A Tapestry node
    When: The node modal is used to edit its permissions
    Then: The node should reflect the permissions
  `, () => {
    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.contains(/access/i).click()

      cy.getByTestId(`node-permissions-public-read`).uncheck()
      cy.submitModal()

      cy.logout().visitTapestry()
      cy.contains(/is empty/i).should("exist")
    })
  })

  const setup = edits => {
    cy.getSelectedNode().then(node => cy.editNode(node.id, { permissions: edits }))
  }

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
