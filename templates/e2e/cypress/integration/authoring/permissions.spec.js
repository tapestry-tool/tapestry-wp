import { setup, cleanup } from "../../support/utils"

describe("Node permissions", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    cy.fixture("two-nodes.json").as("twoNodes")
    setup("@oneNode")
  })
  
  afterEach(cleanup)

  it("Should hide node and associated links if user does not have read access", () => {
    const newNode = {
      permissions: {
        public: [],
      },
    }
    cy.getNodeByIndex(0).editNode(newNode)
    cy.logout().visitTapestry()
    cy.getNodeByIndex(0).should("not.exist")
  })

  it("Should hide edit button if user does not have write access", () => {
    const newNode = {
      permissions: {
        public: ["read"],
        authenticated: ["read", "edit"],
      },
    }
    cy.getNodeByIndex(0).editNode(newNode)

    cy.logout().visitTapestry()
    cy.getDOMNodeByIndex(0)
      .click({ force: true })
      .within(() => {
        cy.get(".editNodeButton").should("not.exist")
      })

    cy.login("subscriber").visitTapestry()
    cy.getDOMNodeByIndex(0)
      .click({ force: true })
      .within(() => {
        cy.get(".editNodeButton").should("exist")
      })
  })

  it("Should hide add button if user does not have add access", () => {
    const newNode = {
      permissions: {
        public: ["read"],
        authenticated: ["read", "add"],
      },
    }
    cy.getNodeByIndex(0).editNode(newNode)

    cy.logout().visitTapestry()
    cy.getDOMNodeByIndex(0)
      .click({ force: true })
      .within(() => {
        cy.get(".addNodeButton").should("not.exist")
      })

    cy.login("subscriber").visitTapestry()
    cy.getDOMNodeByIndex(0)
      .click({ force: true })
      .within(() => {
        cy.get(".addNodeButton").should("exist")
      })
  })
})