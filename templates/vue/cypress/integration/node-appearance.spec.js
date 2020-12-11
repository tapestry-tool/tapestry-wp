describe("Node Appearance", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")
  })

  it("should be able to edit a node's appearance using the node modal", () => {
    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.contains(/appearance/i).click()

      cy.contains(/node title/i).click()
      cy.contains(/media button/i).click()
      cy.contains(/progress bar/i).click()

      cy.contains(/thumbnail/i).click()

      const url =
        "https://upload.wikimedia.org/wikipedia/commons/2/2a/Hummingbird.jpg"

      //TODO: adjust this test to use drag drop instead
      cy.getByTestId("import-file-input").attachFile("reddit.png")

      cy.submitModal()

      cy.getNodeById(node.id).within(() => {
        cy.get("image").should("have.attr", "href", url)
        cy.getByTestId(`node-title-${node.id}`).should("not.exist")
        cy.getByTestId(`node-progress-${node.id}`).should("not.exist")
        cy.getByTestId(`open-node-${node.id}`).should("not.exist")
      })
    })
  })

 

})
