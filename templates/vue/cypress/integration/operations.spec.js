import { TEST_TAPESTRY_NAME } from "../support/constants"

describe("Operations", () => {
  beforeEach(() => {
    cy.fixture("three-nodes.json").as("tapestry")
    cy.setup("@tapestry")
    cy.get(".operations-button").click()
  })

  it(`should be able to duplicate a tapestry`, () => {
    cy.contains(/export\/duplicate tapestry/i).click()
    cy.contains(/duplicate/i).click()

    cy.intercept("POST", "**/tapestries").as("duplicate")

    cy.getByTestId("duplicate-tapestry-button").click()
    cy.getByTestId("spinner").should("be.visible")
    cy.wait("@duplicate")

    cy.getByTestId("duplicate-tapestry-link")
      .should("be.visible")
      .then($el => {
        const { href } = $el.get(0)
        cy.visit(href)
      })

    cy.getByTestId("tapestry-loading").should("not.exist")
    cy.get("@tapestry").then(({ nodes }) => {
      cy.get("#tapestry").within(() => {
        nodes.forEach(node => cy.contains(node.title).should("be.visible"))
      })
    })
    cy.deleteTapestry(`${TEST_TAPESTRY_NAME} (1)`)
  })
})
