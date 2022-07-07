describe("Import Export", () => {
  it("should be able to export a Tapestry", () => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")
    cy.intercept("GET", "**/tapestries/**/export").as("export")

    cy.get(".settings-button").click()
    cy.contains(/advanced/i).click()
    cy.getByTestId("export-tapestry-button").click()

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

  it("should be able to import a Tapestry from a zip file", () => {
    const fullTapestry = "full-export.zip"
    cy.setup()

    cy.intercept("POST", "**/tapestries/**/import_zip").as("import")
    cy.intercept("GET", "**/tapestries/**").as("load")

    cy.getByTestId("import-file-input").attachFile(fullTapestry)
    cy.wait("@import")

    cy.contains(/import successful/i).should("be.visible")
    cy.contains(/no warnings were generated during import/i).should("be.visible")

    cy.contains(/the following permissions/i).should("be.visible")
    cy.getByTestId("import-removed-permissions")
      .as("permissions-list")
      .should("be.visible")
    cy.get("@permissions-list")
      .find("li")
      .should("have.length", 3)

    cy.get("button")
      .contains(/confirm/i)
      .click()
    cy.wait("@load")

    cy.getByTestId("tapestry-loading").should("not.exist")
    const expectedTitles = [
      "Root",
      "Local Video",
      "YouTube Video",
      "Activity (multiple choice)",
      "Activity (drag drop)",
      "Multicontent with background image",
      "H5P",
      "Answer",
      "H5P 2",
      "External Link",
    ]
    cy.wrap(expectedTitles).each(title => cy.getNodeByTitle(title).should("exist"))
  })

  it("should be able to import a Tapestry with missing files and show warnings", () => {
    const fullTapestry = "missing-files.zip"
    cy.setup()

    cy.intercept("POST", "**/tapestries/**/import_zip").as("import")
    cy.intercept("GET", "**/tapestries/**").as("load")

    cy.getByTestId("import-file-input").attachFile(fullTapestry)
    cy.wait("@import")
    cy.contains(/import successful/i).should("be.visible")
    cy.getByTestId("import-warnings-table")
      .as("warnings-table")
      .should("be.visible")
    cy.get("@warnings-table")
      .children()
      .eq(1)
      .find("tr")
      .should("have.length", 6)

    cy.get("button")
      .contains(/confirm/i)
      .click()
    cy.wait("@load")

    cy.getByTestId("tapestry-loading").should("not.exist")
    const expectedTitles = [
      "Root",
      "Local Video",
      "YouTube Video",
      "Activity (multiple choice)",
      "Activity (drag drop)",
      "Multicontent with background image",
      "H5P",
      "Answer",
      "H5P 2",
      "External Link",
    ]
    cy.wrap(expectedTitles).each(title => cy.getNodeByTitle(title).should("exist"))
  })
})
