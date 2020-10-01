import { setup, cleanup } from "../../support/utils"

describe("Node appearance", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    setup("@oneNode")
  })

  afterEach(cleanup)

  const setupThenTest = (newNode, assertions) => {
    cy.getSelectedNode().then(node => {
      cy.wrap(node).editNode(newNode)
      cy.getByTestId(`node-${node.id}`).within(() => assertions(node))
    })
  }

  it("Should show a thumbnail if a thumbnail url is passed", () => {
    const newNode = {
      appearance: {
        thumbnail: {
          url:
            "https://image.shutterstock.com/z/stock-photo-colorful-flower-on-dark-tropical-foliage-nature-background-721703848.jpg",
        },
      },
    }
    setupThenTest(newNode, () => {
      cy.get("image").should("have.attr", "href", newNode.appearance.thumbnail.url)
    })
  })

  it("Should hide node title", () => {
    const newNode = {
      appearance: {
        hideTitle: true,
      },
    }
    setupThenTest(newNode, node => {
      cy.getByTestId(`node-title-${node.id}`).should("not.exist")
    })
  })

  it("Should hide progress bar", () => {
    const newNode = {
      appearance: {
        hideProgress: true,
      },
    }
    setupThenTest(newNode, node => {
      cy.getByTestId(`node-progress-${node.id}`).should("not.exist")
    })
  })

  it("Should hide media button", () => {
    const newNode = {
      appearance: {
        hideMedia: true,
      },
    }
    setupThenTest(newNode, node => {
      cy.getByTestId(`open-node-${node.id}`).should("not.exist")
    })
  })

  it("Should be able to open lightbox by clicking on center of node if media button is hidden", () => {
    const newNode = {
      appearance: {
        hideMedia: true,
      },
    }
    cy.getSelectedNode().then(node => {
      cy.wrap(node).editNode(newNode)
      cy.getByTestId(`node-${node.id}`).click()
    })
    cy.get("#lightbox").should("exist")
  })
})
