describe("External link", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
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

  it("should be able to add an external link using the file upload")
})
