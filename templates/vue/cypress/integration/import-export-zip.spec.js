describe("Import Export Zip Files", () => {
  it("should be able to import a Tapestry from a zip file", () => {
    const fullTapestry = "full-export.zip"
    cy.setup()

    cy.intercept("POST", "**/tapestries/**/import_zip").as("import")
    cy.intercept("GET", "**/tapestries/**").as("load")

    cy.getByTestId("import-file-input").attachFile(fullTapestry)
    cy.task("log", "Line 10")
    cy.wait("@import")
    cy.task("log", "Line 12")

    // File size of zip - verifying the zip was uploaded properly
    cy.contains("16918").should("be.visible")

    cy.contains(/Please try with another file/).should("not.exist")
    cy.task("log", "Line 18")
    cy.contains(/import successful/i).should("be.visible")
    cy.task("log", "Line 20")
    cy.contains(/no warnings were generated during import/i).should("be.visible")
    cy.task("log", "Line 22")

    cy.contains(/the following permissions/i).should("be.visible")
    cy.task("log", "Line 25")
    cy.getByTestId("import-removed-permissions").should("be.visible")
    cy.task("log", "Line 27")
    cy.getByTestId("import-removed-permissions")
      .find("li")
      .should("have.length", 3)
    cy.task("log", "Line 31")

    cy.contains("button", /confirm/i).should("exist")
    cy.task("log", "Line 34")
    cy.contains("button", /confirm/i).click()
    cy.task("log", "Line 36")

    cy.wait("@load")
    cy.task("log", "Line 39")

    cy.getByTestId("tapestry-loading").should("not.exist")
    cy.task("log", "Line 42")
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
    cy.task("log", "Line 54")
  })

  it("should be able to import a Tapestry with missing files and show warnings", () => {
    const fullTapestry = "missing-files.zip"
    cy.setup()

    cy.intercept("POST", "**/tapestries/**/import_zip").as("import")
    cy.intercept("GET", "**/tapestries/**").as("load")

    cy.getByTestId("import-file-input").attachFile(fullTapestry)
    cy.task("log", "Line 65")
    cy.wait("@import")
    cy.task("log", "Line 67")
    cy.contains(/Please try with another file/).should("not.exist")
    cy.task("log", "Line 69")
    cy.contains(/import successful/i).should("be.visible")
    cy.task("log", "Line 71")
    cy.getByTestId("import-warnings-table").should("be.visible")
    cy.task("log", "Line 73")
    cy.getByTestId("import-warnings-table")
      .children()
      .eq(1)
      .find("tr")
      .should("have.length", 5)
    cy.task("log", "Line 79")

    cy.contains("button", /confirm/i).click()
    cy.task("log", "Line 82")

    cy.wait("@load")
    cy.task("log", "Line 85")

    cy.getByTestId("tapestry-loading").should("not.exist")
    cy.task("log", "Line 88")
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
    cy.task("log", "Line 100")
  })
})
