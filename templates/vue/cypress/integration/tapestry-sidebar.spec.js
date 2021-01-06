describe("Tapestry Sidebar", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")
  })

  it("should be able render view lightbox and edit node modal", () => {
    cy.getSelectedNode().then(node => {
      cy.getByTestId(`sidebar-toggle`).click()
      cy.getByTestId(`sidebar-view-btn`).click()
      cy.contains(node.typeData.textContent).should("be.visible")
      cy.getByTestId(`close-lightbox`).click()

      cy.getByTestId(`sidebar-edit-btn`).click()
      cy.contains(/Edit node/i).should("be.visible")
    })
  })
})
