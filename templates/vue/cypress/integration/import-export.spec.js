describe("Import Export", () => {
  it("export endpoint should return not null response body", () => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")
    cy.server()
    cy.route("GET", "**/tapestries/**/export").as("export")

    cy.get('.settings-button').click()
    cy.contains(/advanced/i).click()
    cy.get('#export-button').click()

    cy.wait('@export')
    .then((xhr) => {
        assert.isNotNull(xhr.response.body, "response body not null")
    })
    
    cy.contains(/exported/i).should('be.visible') 
  })

  it("should be able to import a Tapestry using file input", () => {
    const tapestry = "complex-multinode.json"
    cy.setup()
    cy.server()
    cy.route("PUT", "**/tapestries/**").as("import")
    cy.route("GET", "**/tapestries/**").as("load")

    cy.getByTestId("import-file-input").attachFile(tapestry)
    cy.wait("@import")

    cy.contains(/import successful/i).should("be.visible")
    cy.get('button').contains(/confirm/i).click()
    cy.wait("@load")

    cy.contains(/loading/i).should("not.exist")
    cy.fixture(tapestry).then(({ nodes }) => {
      nodes.forEach(node => cy.getNodeByTitle(node.title).should("exist"))
    })
  })

  it("should be able to import a Tapestry using old export file input", () => {
    const tapestry = "one-node.json"
    cy.setup()

    cy.server()
    cy.route("PUT", "**/tapestries/**").as("import")
    cy.route("GET", "**/tapestries/**").as("load")

    cy.getByTestId("import-file-input").attachFile(tapestry)
    cy.wait("@import")

    cy.contains(/import successful/i).should("be.visible")
    cy.get('button').contains(/confirm/i).click()
    cy.wait("@load")

    cy.contains(/loading/i).should("not.exist")
    cy.fixture(tapestry).then(({ nodes }) => {
      nodes.forEach(node => cy.getNodeByTitle(node.title).should("exist"))
    })
  })
})

