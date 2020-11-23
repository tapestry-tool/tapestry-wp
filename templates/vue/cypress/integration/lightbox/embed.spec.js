describe("External link", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")
  })

  it("should be able to add an external link using the url input", () => {
    const newNode = {
      title: "5 JavaScript Tricks That Are Good To Know",
      url:
        "https://levelup.gitconnected.com/5-javascript-tricks-that-are-good-to-know-78045dea6678",
    }
    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("url-embed")
      cy.getByTestId(`node-link-url`).type(newNode.url)
      cy.contains(/new window/i).click()
      cy.submitModal()

      cy.openLightbox(node.id).within(() => {
        cy.contains(newNode.title).should("exist")
      })
    })
  })

  /**
   * [CI FAIL] indicates that the test fails in Tapestry's CI environment. These
   * tests are failing because of a Docker-WordPress permissions issue. See the
   * following Asana task for details:
   *  - https://app.asana.com/0/1126491658233864/1198968596220741
   */
  it("[CI FAIL] should be able to add an external link using the file upload", () => {
    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("url-embed")

      cy.server()
      cy.route("POST", "**/async-upload.php").as("upload")

      cy.get("[name=async-upload]").attachFile("reddit.png")
      cy.wait("@upload")
        .its("response.body.data.url")
        .then(url => {
          cy.getByTestId("node-link-url").should("have.value", url)
          cy.submitModal()

          cy.openLightbox(node.id)
          cy.get("iframe").should("have.attr", "src", url)
        })
    })
  })
})
