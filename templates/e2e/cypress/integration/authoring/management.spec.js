import { setup, cleanup } from "../../support/utils"

describe("Basic node management", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    cy.fixture("two-nodes.json").as("twoNodes")
  })

  afterEach(cleanup)
  
  it("Should be able to add and see a root node", () => {
    setup()

    const node = {
      title: "Root",
      description: "I am a root node",
      mediaType: "text",
      typeData: {
        textContent: "Abcd",
      }
    }
    cy.addNode(node).should("exist")
    cy.contains(node.title).should("exist")
  })

  it("Should be able to open edit modal", () => {
    setup("@oneNode")

    cy.getNodeByIndex(0)
      .editNode()
      .should("exist")
  })

  it("Should be able to open add modal", () => {
    setup("@oneNode")

    cy.getNodeByIndex(0)
      .addNode()
      .should("exist")
  })

  it("Should be able to add child nodes", () => {
    setup("@oneNode")

    const nodes = [
      {
        title: "Child 1",
        description: "I am a child 1",
        mediaType: "text",
        typeData: {
          textContent: "Abcd",
        },
      },
      {
        title: "Child 2",
        description: "I am a child 2",
        mediaType: "text",
        typeData: {
          textContent: "Abcd",
        },
      },
    ]

    for (const node of nodes) {
      cy.getNodeByIndex(0)
        .addNode(node)
        .should("exist")
      cy.contains(node.title).should("exist")
    }
  })

  it("Should be able to open add modal", () => {
    setup("@oneNode")

    cy.getNodeByIndex(0)
      .addNode()
      .should("exist")
  })

  it("Should be able to delete a leaf node", () => {
    setup("@twoNodes")

    cy.getNodeByIndex(1).deleteNode()
    cy.getNodeByIndex(1).should("not.exist")
  })
})