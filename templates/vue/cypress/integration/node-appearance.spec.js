import { setup } from "../support/utils"

describe("Node Appearance", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    setup("@oneNode")
  })

  const setupThenTest = (newNode, assertions) => {
    cy.getSelectedNode().then(node => {
      cy.wrap(node).editNodeInStore(newNode)
      cy.getByTestId(`node-${node.id}`).within(() => assertions(node))
    })
  }

  it(`
    Given: A Tapestry node
    When: An image is added then removed
    Then: It should first show the image then hide it
  `, () => {
    const newNode = {
      imageURL:
        "https://image.shutterstock.com/z/stock-photo-colorful-flower-on-dark-tropical-foliage-nature-background-721703848.jpg",
    }
    setupThenTest(newNode, () => {
      cy.get("image").should("have.attr", "href", newNode.imageURL)
    })
  })

  it(`
    Given: A Tapestry node
    When: Its title is hidden
    Then: It should hide its title
  `, () => {
    const newNode = {
      hideTitle: true,
    }
    setupThenTest(newNode, node => {
      cy.getByTestId(`node-title-${node.id}`).should("not.exist")
    })
  })

  it(`
    Given: A Tapestry node
    When: Its progress bar is hidden
    Then: It should hide its progress bar
  `, () => {
    setupThenTest({ hideProgress: true }, node => {
      cy.getByTestId(`node-progress-${node.id}`).should("not.exist")
    })
  })

  it(`
    Given: A Tapestry node
    When: Its media button is hidden
    Then: It should hide its media button
  `, () => {
    const newNode = {
      hideMedia: true,
    }
    setupThenTest(newNode, node => {
      cy.getByTestId(`open-node-${node.id}`).should("not.exist")
    })
  })
})
