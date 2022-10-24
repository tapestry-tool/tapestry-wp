describe("Export", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")

    cy.intercept("GET", "**/tapestries/**/export").as("export")
    cy.intercept("GET", "**/tapestries/**/export_zip").as("export_zip")
  })

  it("should be able to export a Tapestry", () => {
    cy.get(".operations-button").click()
    cy.contains(/export\/duplicate tapestry/i).click()
    cy.getByTestId("include-media").click({ force: true })
    cy.getByTestId("export-tapestry-button").click()

    cy.wait("@export")
      .its("response.body")
      .then(data => {
        expect("json" in data).to.be.true
        expect("nodes" in data.json).to.be.true
      })

    cy.contains(/exported/i).should("be.visible")
  })

  it("should be able to export a Tapestry as a zip file", () => {
    cy.get(".operations-button").click()
    cy.contains(/export\/duplicate tapestry/i).click()
    cy.getByTestId("export-tapestry-button").click()

    cy.wait("@export_zip")
      .its("response.body")
      .then(data => {
        expect("zipUrl" in data).to.be.true
        expect("wpPosts" in data).to.be.false
      })

    cy.contains(".alert-success", /exported/i).should("be.visible")
    cy.contains(".alert-success", /xml file/i).should("not.exist")
  })

  it("should be able to export a Tapestry as a zip file and WordPress posts", () => {
    cy.getSelectedNode().then(node => {
      cy.editNode(node.id, {
        mediaType: "wp-post",
        typeData: {
          ...node.typeData,
          mediaURL: 1,
        },
      })
    })

    cy.get(".operations-button").click()
    cy.contains(/export\/duplicate tapestry/i).click()
    cy.getByTestId("export-tapestry-button").click()

    cy.wait("@export_zip")
      .its("response.body")
      .then(JSON.parse)
      .then(data => {
        expect("zipUrl" in data).to.be.true
        expect("wpPosts" in data).to.be.true
      })

    cy.contains(".alert-success", /exported/i).should("be.visible")
    cy.contains(".alert-success", /xml file/i).should("be.visible")
  })

  it("should be able to export a Tapestry with warnings", () => {
    const nonexistentImageUrl =
      Cypress.config("baseUrl") + "/wp-content/uploads/reddit-0.png"
    const nonexistentFileId = 987654321

    cy.getSelectedNode().then(node => {
      cy.editNode(node.id, {
        mediaType: "activity",
        imageUrl: nonexistentImageUrl,
        thumbnailFileId: nonexistentFileId,
        typeData: {
          ...node.typeData,
          activity: {
            questions: [
              {
                text: "Question",
                followUp: {
                  enabled: false,
                  text: "",
                  nodeId: null,
                  questionId: null,
                },
                answerTypes: {
                  text: {
                    enabled: false,
                    placeholder: "",
                    isMultiLine: false,
                    allowMultiple: false,
                    minFields: 1,
                    maxFields: 100,
                  },
                  audio: { enabled: false },
                  dragDrop: {
                    enabled: true,
                    buckets: [
                      {
                        id: "3d37b350-0cc2-4ec9-a2e5-ad90cd37fef0",
                        type: "from",
                        text: "A",
                      },
                      {
                        id: "f732da5c-3356-4869-a634-f186228656c9",
                        type: "to",
                        text: "B",
                      },
                    ],
                    items: [
                      {
                        id: "fc0bb16a-f38b-4961-8bd2-c7d58a2f1555",
                        color: "#808080",
                        text: "Item",
                        imageUrl: nonexistentImageUrl,
                        bucketId: "3d37b350-0cc2-4ec9-a2e5-ad90cd37fef0",
                      },
                    ],
                    useImages: true,
                  },
                  multipleChoice: {
                    enabled: false,
                    allowSelectMultiple: false,
                    useImages: false,
                    choices: [],
                    preSelectedOptions: [],
                  },
                },
                confirmation: { title: "", message: "" },
                completed: false,
                optional: false,
                id: "5a457076-8065-4bd4-8bf0-fdf525b62937",
              },
            ],
          },
        },
      })
    })

    cy.get(".operations-button").click()
    cy.contains(/export\/duplicate tapestry/i).click()
    cy.getByTestId("export-tapestry-button").click()

    cy.wait("@export_zip")
      .its("response.body")
      .then(data => {
        expect("zipUrl" in data).to.be.true
        expect("wpPosts" in data).to.be.false
      })

    cy.contains(".alert-warning", /exported with warnings/i).should("be.visible")
    cy.getByTestId("export-warnings-table")
      .should("be.visible")
      .get("tr")
      .find("li")
      .should("have.length", 2)
  })
})

describe("Import", () => {
  beforeEach(() => {
    cy.setup()

    cy.intercept("PUT", "**/tapestries/**").as("import")
    cy.intercept("POST", "**/tapestries/**/import_zip").as("import_zip")
    cy.intercept("GET", "**/tapestries/**").as("load")
  })

  it("should be able to import a Tapestry using file input", () => {
    const tapestry = "full-featured-exported-tapestry.json"
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
    cy.getByTestId("import-file-input").attachFile(invalidImportFile)
    cy.contains(/Please upload a JSON file or a ZIP file/i).should("be.visible")
  })

  it("should not be able to import a zip with no tapestry.json", () => {
    const invalidImportFile = "no-tapestry-json.zip"
    cy.getByTestId("import-file-input").attachFile(invalidImportFile)
    cy.wait("@import_zip")
    cy.contains(/Could not find tapestry\.json in zip/i).should("be.visible")
  })

  it("should not be able to import a zip where tapestry.json is not valid JSON", () => {
    const invalidImportFile = "invalid-json-tapestry-json.zip"
    cy.getByTestId("import-file-input").attachFile(invalidImportFile)
    cy.wait("@import_zip")
    cy.contains(/Tapestry data is invalid/i).should("be.visible")
  })

  it("should not be able to import a zip where tapestry.json is missing required fields", () => {
    const invalidImportFile = "invalid-tapestry-json.zip"
    cy.getByTestId("import-file-input").attachFile(invalidImportFile)
    cy.wait("@import_zip")
    cy.contains(/Tapestry data is invalid/i).should("be.visible")
  })

  it("should not be able to import a zip file with subdirectories", () => {
    const invalidImportFile = "invalid-zip-structure.zip"
    cy.getByTestId("import-file-input").attachFile(invalidImportFile)
    cy.wait("@import_zip")
    cy.contains(/Zip file is invalid/i).should("be.visible")
  })

  it("should be able to import a Tapestry from a zip file", () => {
    const fullTapestry = "full-export.zip"
    cy.getByTestId("import-file-input").attachFile(fullTapestry)
    cy.wait("@import_zip")

    cy.contains(/Please try with another file/).should("not.exist")
    cy.contains(/import successful/i).should("be.visible")
    cy.contains(/no warnings were generated during import/i).should("be.visible")

    cy.contains(/the following permissions/i).should("be.visible")
    cy.getByTestId("import-removed-permissions")
      .should("be.visible")
      .find("li")
      .should("have.length", 3)

    cy.contains("button", /confirm/i).click()
    cy.wait("@load")

    cy.getByTestId("tapestry-loading").should("not.exist")
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
  })

  it("should be able to import a zip with missing files and show warnings", () => {
    const tapestryWithWarnings = "missing-files.zip"
    cy.getByTestId("import-file-input").attachFile(tapestryWithWarnings)
    cy.wait("@import_zip")
    cy.contains(/Please try with another file/).should("not.exist")
    cy.contains(/import successful/i).should("be.visible")
    cy.getByTestId("import-warnings-table")
      .should("be.visible")
      .children()
      .eq(1)
      .find("tr")
      .should("have.length", 5)

    cy.contains("button", /confirm/i).click()
    cy.wait("@load")

    cy.getByTestId("tapestry-loading").should("not.exist")
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
  })

  it("should show a warning when importing a zip that was exported with warnings", () => {
    const tapestryWithWarnings = "has-export-warnings.zip"

    cy.getByTestId("import-file-input").attachFile(tapestryWithWarnings)
    cy.wait("@import_zip")
    cy.contains(/Please try with another file/).should("not.exist")
    cy.contains(/import successful/i).should("be.visible")
    cy.contains(".alert-warning", /exported with warnings/i).should("be.visible")

    cy.contains("button", /confirm/i).click()
    cy.wait("@load")

    cy.getByTestId("tapestry-loading").should("not.exist")
    cy.getNodeByTitle("Root").should("exist")
  })
})
