describe("Import Export", () => {
  it("should be able to import a Tapestry using the file input", () => {
    const tapestry = "root.json"
    cy.setup()

    cy.server()
    cy.route("PUT", "**/tapestries/**").as("import")
    cy.route("GET", "**/tapestries/**").as("load")

    cy.getByTestId("import-file-input").attachFile(tapestry)
    cy.wait("@import")
    cy.wait("@load")

    cy.contains(/loading/i).should("not.exist")
    cy.fixture(tapestry).then(({ nodes }) => {
      nodes.forEach(node => cy.getNodeByTitle(node.title).should("exist"))
    })
  })
})
