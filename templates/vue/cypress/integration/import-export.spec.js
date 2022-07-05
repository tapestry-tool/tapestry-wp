describe("Import Export", () => {
  it("should be able to export a Tapestry", () => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")
    cy.intercept("GET", "**/tapestries/**/export").as("export")

    cy.get(".settings-button").click()
    cy.contains(/advanced/i).click()
    cy.get("#export-button").click()

    cy.wait("@export")
      .its("response.body")
      .then(data => {
        expect("nodes" in data).to.be.true
      })

    cy.contains(/exported/i).should("be.visible")
  })

  it("should be able to import a Tapestry using file input", () => {
    const tapestry = "full-featured-exported-tapestry.json"
    cy.setup()
    cy.intercept("PUT", "**/tapestries/**").as("import")
    cy.intercept("GET", "**/tapestries/**").as("load")

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

    cy.intercept("PUT", "**/tapestries/**").as("import")
    cy.intercept("GET", "**/tapestries/**").as("load")

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

  it("should not be able to import a file that is not zip or json", () => {
    const invalidImportFile = "reddit.png"
    cy.setup()

    cy.getByTestId("import-file-input").attachFile(invalidImportFile)
    cy.contains(/Please upload a JSON file or a ZIP file/i).should("be.visible")
  })

  it("should not be able to import a zip with no tapestry.json", () => {
    const invalidImportFile = "no-tapestry-json.zip"
    cy.setup()

    cy.intercept("POST", "**/tapestries/**/import_zip").as("import")

    cy.getByTestId("import-file-input").attachFile(invalidImportFile)
    cy.wait("@import")
    cy.contains(/Zip file is invalid/i).should("be.visible")
  })

  it("should not be able to import a zip where tapestry.json is not valid JSON", () => {
    const invalidImportFile = "invalid-json-tapestry-json.zip"
    cy.setup()

    cy.intercept("POST", "**/tapestries/**/import_zip").as("import")

    cy.getByTestId("import-file-input").attachFile(invalidImportFile)
    cy.wait("@import")
    cy.contains(/Tapestry data is invalid/i).should("be.visible")
  })

  it("should not be able to import a zip where tapestry.json is missing required fields", () => {
    const invalidImportFile = "invalid-tapestry-json.zip"
    cy.setup()

    cy.intercept("POST", "**/tapestries/**/import_zip").as("import")

    cy.getByTestId("import-file-input").attachFile(invalidImportFile)
    cy.wait("@import")
    cy.contains(/Tapestry data is invalid/i).should("be.visible")
  })

  it("should not be able to import a zip file with subdirectories", () => {
    const invalidImportFile = "invalid-zip-structure.zip"
    cy.setup()

    cy.intercept("POST", "**/tapestries/**/import_zip").as("import")

    cy.getByTestId("import-file-input").attachFile(invalidImportFile)
    cy.wait("@import")
    cy.contains(/Zip file is invalid/i).should("be.visible")
  })
})
