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
        expect("json" in data).to.be.true
        expect("nodes" in data.json).to.be.true
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
    cy.task("log", "Line 123")
    cy.wait("@import")
    cy.task("log", "Line 125")

    cy.contains(/Please try with another file/).should("not.exist")
    cy.task("log", "Line 128")
    cy.contains(/import successful/i).should("be.visible")
    cy.task("log", "Line 130")
    cy.contains(/no warnings were generated during import/i).should("be.visible")
    cy.task("log", "Line 132")

    cy.contains(/the following permissions/i).should("be.visible")
    cy.task("log", "Line 135")
    cy.getByTestId("import-removed-permissions").should("be.visible")
    cy.task("log", "Line 137")
    cy.getByTestId("import-removed-permissions")
      .find("li")
      .should("have.length", 3)
    cy.task("log", "Line 141")

    cy.contains("button", /confirm/i).click({ force: true })
    cy.task("log", "Line 144")
    cy.wait("@load")
    cy.task("log", "Line 146")

    cy.getByTestId("tapestry-loading").should("not.exist")
    cy.task("log", "Line 149")
    const expectedTitles = [
      "Root",
      "Local Video",
      "YouTube Video",
      "Activity (multiple choice)",
      "Activity (drag drop)",
      "Multicontent with background image",
      "Answer",
      "External Link",
    ]
    cy.wrap(expectedTitles).each(title => cy.getNodeByTitle(title).should("exist"))
    cy.task("log", "Line 161")
  })

  it("should be able to import a Tapestry with missing files and show warnings", () => {
    const fullTapestry = "missing-files.zip"
    cy.setup()

    cy.intercept("POST", "**/tapestries/**/import_zip").as("import")
    cy.intercept("GET", "**/tapestries/**").as("load")

    cy.getByTestId("import-file-input").attachFile(fullTapestry)
    cy.task("log", "Line 172")
    cy.wait("@import")
    cy.task("log", "Line 174")
    cy.contains(/Please try with another file/).should("not.exist")
    cy.task("log", "Line 176")
    cy.contains(/import successful/i).should("be.visible")
    cy.task("log", "Line 178")
    cy.getByTestId("import-warnings-table").should("be.visible")
    cy.task("log", "Line 180")
    cy.getByTestId("import-warnings-table")
      .children()
      .eq(1)
      .find("tr")
      .should("have.length", 5)
    cy.task("log", "Line 186")

    cy.contains("button", /confirm/i).click({ force: true })
    cy.task("log", "Line 189")
    cy.wait("@load")
    cy.task("log", "Line 191")

    cy.getByTestId("tapestry-loading").should("not.exist")
    cy.task("log", "Line 194")
    const expectedTitles = [
      "Root",
      "Local Video",
      "YouTube Video",
      "Activity (multiple choice)",
      "Activity (drag drop)",
      "Multicontent with background image",
      "Answer",
      "External Link",
    ]
    cy.wrap(expectedTitles).each(title => cy.getNodeByTitle(title).should("exist"))
    cy.task("log", "Line 206")
  })
})
