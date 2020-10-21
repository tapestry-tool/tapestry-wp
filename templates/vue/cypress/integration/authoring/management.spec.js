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
      },
    }
    cy.addNode(node)
    cy.contains(node.title).should("exist")
  })

  it("Should be able to open edit modal", () => {
    setup("@oneNode")

    cy.getSelectedNode()
      .editNode()
      .should("exist")
  })

  it("Should be able to open add modal", () => {
    setup("@oneNode")

    cy.getSelectedNode()
      .addNode()
      .should("exist")
  })

  it("Should be able to add child nodes", () => {
    setup("@oneNode")

    cy.get("@oneNode").then(tapestry => {
      const rootNode = tapestry.nodes[0]
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
        cy.getNodeByTitle(rootNode.title).addNode(node)
        cy.contains(node.title).should("exist")
        cy.get("#node-modal").should("not.exist")
      }
    })
  })

  it("Should be able to delete a leaf node", () => {
    setup("@twoNodes")

    cy.get("@twoNodes").then(tapestry => {
      const leaf = tapestry.nodes[1]
      cy.getNodeByTitle(leaf.title).deleteNode()
      cy.getNodeByTitle(leaf.title).should("be.null")
    })
  })
})
