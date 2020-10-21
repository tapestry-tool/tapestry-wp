import { setup as setupTapestry, cleanup } from "../../support/utils"

describe("Node permissions", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    cy.fixture("two-nodes.json").as("twoNodes")
    setupTapestry("@oneNode")
  })

  afterEach(cleanup)

  const setup = edits => {
    setupTapestry("@oneNode")
    cy.getSelectedNode().editNode({ permissions: edits })
  }

  it("Should hide node and associated links if user does not have read access", () => {
    setup({
      public: [],
    })
    cy.logout().visitTapestry()
    cy.contains(/is empty/i).should("exist")
  })

  it("Should hide edit button if user does not have write access", () => {
    setup({
      public: ["read"],
      authenticated: ["read", "edit"],
    })
    cy.getSelectedNode().then(node => {
      cy.logout().visitTapestry()
      cy.getByTestId(`edit-node-${node.id}`).should("not.exist")

      cy.login("subscriber").visitTapestry()
      cy.getByTestId(`edit-node-${node.id}`).should("exist")
    })
  })

  it("Should hide add button if user does not have add access", () => {
    setup({
      public: ["read"],
      authenticated: ["read", "add"],
    })
    cy.getSelectedNode().then(node => {
      cy.logout().visitTapestry()
      cy.getByTestId(`add-node-${node.id}`).should("not.exist")

      cy.login("subscriber").visitTapestry()
      cy.getByTestId(`add-node-${node.id}`).should("exist")
    })
  })
})
