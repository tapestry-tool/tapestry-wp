import { setup, cleanup } from "../../support/utils"

describe("Node appearance", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    cy.fixture("two-nodes.json").as("twoNodes")
    setup("@oneNode")
  })

  afterEach(cleanup)

  it("Should show a thumbnail if a thumbnail url is passed", () => {
    const newNode = {
      appearance: {
        thumbnail: {
          url:
            "https://image.shutterstock.com/z/stock-photo-colorful-flower-on-dark-tropical-foliage-nature-background-721703848.jpg",
        },
      },
    }

    cy.getNodeByIndex(0).editNode(newNode)
    cy.getDOMNodeByIndex(0).within(() => {
      cy.get("image").should("have.attr", "href", newNode.appearance.thumbnail.url)
    })
  })

  it("Should hide node title", () => {
    const newNode = {
      appearance: {
        hideTitle: true,
      },
    }
    cy.getNodeByIndex(0).editNode(newNode)
    cy.getDOMNodeByIndex(0).within(() => {
      cy.get(".meta").should("not.exist")
    })
  })

  it("Should hide progress bar", () => {
    const newNode = {
      appearance: {
        hideProgress: true,
      },
    }
    cy.getNodeByIndex(0).editNode(newNode)
    cy.getDOMNodeByIndex(0).within(() => {
      cy.get("path").should("not.exist")
    })
  })

  it("Should hide media button", () => {
    const newNode = {
      appearance: {
        hideMedia: true,
      },
    }
    cy.getNodeByIndex(0).editNode(newNode)
    cy.getDOMNodeByIndex(0).within(() => {
      cy.get(".mediaButton").should("be.hidden")
    })
  })

  it("Should be able to open lightbox by clicking on center of node if media button is hidden", () => {
    const newNode = {
      appearance: {
        hideMedia: true,
      },
    }
    cy.getNodeByIndex(0).editNode(newNode)
    cy.getDOMNodeByIndex(0).click()
    cy.get("#lightbox").should("exist")
  })
})