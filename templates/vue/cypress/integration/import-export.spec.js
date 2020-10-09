describe("Import Export", () => {
  it(`
    Given: An empty Tapestry
    When: A Tapestry JSON is imported using the file input
    Then: The Tapestry should be imported
  `, () => {
    const tapestry = "root.json"
    cy.setup()

    cy.server()
    cy.route("PUT", "**/tapestries/**").as("import")
    cy.route("GET", "**/tapestries/**").as("load")

    cy.getByTestId("import-file-input").attachFile(tapestry)
    cy.wait("@import")
    cy.wait("@load")

    cy.fixture(tapestry).then(({ nodes }) => {
      nodes.forEach(node => cy.getNodeByTitle(node.title).should("exist"))
    })
  })
})
