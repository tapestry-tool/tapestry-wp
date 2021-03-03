describe("Import Export", () => {
  it("should be able to export a Tapestry", () => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")
    cy.server()
    cy.route("GET", "**/tapestries/**/export").as("export")

    cy.get(".settings-button").click()
    cy.contains(/advanced/i).click()
    cy.get("#export-button").click()

    cy.wait("@export")
      .its("response.body")
      .should("not.be.null")

    cy.contains(/exported/i).should("be.visible")
  })

  it("should be able to import a Tapestry using file input", () => {
    const tapestry = "full-featured-exported-tapestry.json"
    cy.setup()
    cy.server()
    cy.route("PUT", "**/tapestries/**").as("import")
    cy.route("GET", "**/tapestries/**").as("load")

    cy.getByTestId("import-file-input").attachFile(tapestry)
    cy.wait("@import")

    cy.contains(/import successful/i).should("be.visible")
    cy.get("button")
      .contains(/confirm/i)
      .click()
    cy.wait("@load")

    cy.getByTestId("tapestry-loading").should("not.exist")
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
    cy.get("button")
      .contains(/confirm/i)
      .click()
    cy.wait("@load")

    cy.getByTestId("tapestry-loading").should("not.exist")
    cy.fixture(tapestry).then(({ nodes }) => {
      nodes.forEach(node => cy.getNodeByTitle(node.title).should("exist"))
    })
  })
})
