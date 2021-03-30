describe("Node Permissions", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
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

  it("should not see add button or draft button if drafts disabled", () => {
    cy.get(".settings-button").click()
    cy.contains(/access/i).click()
    cy.getByTestId(`enable-draft`).click({ force: true })
    cy.submitSettingsModal()
    cy.visitTapestry()
    cy.getSelectedNode().then(node => {
      cy.openModal("add", node.id)
      cy.get("#draft-button").should("not.exist")
    })
    cy.logout()
    cy.login("subscriber").visitTapestry()
    cy.getSelectedNode().then(node => {
      cy.getByTestId(`add-node-${node.id}`).should("not.exist")
    })
  })

  it("should not see submit for review button if submit for review disabled", () => {
    setup({
      public: ["read"],
      authenticated: ["read"],
    })
    cy.get(".settings-button").click()
    cy.contains(/access/i).click()
    cy.getByTestId(`enable-submit-review`).click({ force: true })
    cy.submitSettingsModal()
    cy.logout().visitTapestry()
    cy.getSelectedNode().then(node => {
      cy.login("subscriber").visitTapestry()
      cy.openModal("add", node.id)
      cy.getByTestId("submit-node-modal").should("not.exist")
      cy.get("#draft-button").should("exist")
    })
  })
})
