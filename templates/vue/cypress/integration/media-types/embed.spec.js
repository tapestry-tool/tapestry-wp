import { setup } from "../../support/utils"

describe("External link", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    setup("@oneNode")
  })

  it(`
    Given: A Tapestry node
    When: It's changed to an external link node and opened
    Then: It should show a summary of the external link
  `, () => {
    const newNode = {
      title: "5 JavaScript Tricks That Are Good To Know",
      url:
        "https://levelup.gitconnected.com/5-javascript-tricks-that-are-good-to-know-78045dea6678",
    }
    cy.getSelectedNode().then(node => {
      cy.getByTestId(`edit-node-${node.id}`).click()
      cy.getByTestId(`node-media-type`).select("url-embed")
      cy.getByTestId(`node-link-url`).type(newNode.url)
      cy.contains(/new window/i).click()
      cy.submitModal()

      cy.getByTestId(`open-node-${node.id}`).click()
      cy.getByTestId("lightbox").within(() => {
        cy.contains(newNode.title).should("exist")
      })
    })
  })

  it(`
    Given: An external link node
    When: A file is uploaded
    Then: It should show an iframe with that file's url
  `)
})
