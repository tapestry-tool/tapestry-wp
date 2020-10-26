describe("Node Permissions", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    cy.setup("@oneNode")
  })

  it("should be able to edit node permissions using the node modal", () => {
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

  it("should not see the edit button if the user doesn't have edit permission", () => {
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

  it("should not see the add button if the user doesn't have add permission", () => {
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
