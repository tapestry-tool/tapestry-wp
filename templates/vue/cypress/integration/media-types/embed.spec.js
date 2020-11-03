import { setup } from "../../support/utils"

describe("External link", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
    setup("@oneNode")
  })

  it(`
    Given: A Tapestry node
    When: It's changed to an external link node and opened
    Then: It should show a summary of the external link
  `, () => {
    const newNode = {
      mediaType: "url-embed",
      typeData: {
        behaviour: "new-window",
        title: "5 JavaScript Tricks That Are Good To Know",
        url:
          "https://levelup.gitconnected.com/5-javascript-tricks-that-are-good-to-know-78045dea6678",
      },
    }
    cy.getSelectedNode()
      .editNode(newNode)
      .openLightbox()
      .within(() => {
        cy.contains(newNode.typeData.title).should("exist")
      })
  })

  it(`
    Given: An external link node
    When: A file is uploaded
    Then: It should show an iframe with that file's url
  `)
})
