describe("Review Nodes", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
  })

  it("Should be able to create an h5p node from existing h5p content", () => {
    cy.setup("@oneNode")
    cy.getSelectedNode().then(root => {
      cy.getByTestId(`add-node-${root.id}`).click()
      cy.getByTestId(`node-title`).type("Math Quiz 1")
      cy.getByTestId(`node-media-type`).select("h5p")
      cy.getByTestId(`h5p-content-select`).click()
      cy.contains("Math Quiz").click()
      cy.submitModal(30000)
    })
  })
})
